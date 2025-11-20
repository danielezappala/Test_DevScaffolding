"""Prometheus metrics setup and middleware"""

import time
from typing import Callable

from fastapi import FastAPI, Request, Response
from prometheus_client import (
    Counter,
    Gauge,
    Histogram,
    generate_latest,
    CONTENT_TYPE_LATEST,
)
from starlette.responses import Response as StarletteResponse


# Define metrics
http_requests_total = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status_code"]
)

http_request_duration_seconds = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["method", "endpoint"]
)

http_requests_in_progress = Gauge(
    "http_requests_in_progress",
    "Number of HTTP requests in progress",
    ["method", "endpoint"]
)

active_sessions = Gauge(
    "active_sessions_total",
    "Number of active user sessions"
)


def setup_metrics(app: FastAPI):
    """
    Setup Prometheus metrics endpoint.
    
    Adds /metrics endpoint to the FastAPI application for Prometheus scraping.
    
    Args:
        app: FastAPI application instance
    """
    
    @app.get("/metrics")
    async def metrics():
        """
        Prometheus metrics endpoint.
        
        Returns:
            Prometheus metrics in text format
        """
        return StarletteResponse(
            content=generate_latest(),
            media_type=CONTENT_TYPE_LATEST
        )


async def metrics_middleware(request: Request, call_next: Callable):
    """
    Middleware for collecting HTTP request metrics.
    
    Tracks request count, duration, and in-progress requests.
    
    Args:
        request: Incoming HTTP request
        call_next: Next middleware/handler in chain
        
    Returns:
        HTTP response
    """
    # Skip metrics collection for /metrics endpoint
    if request.url.path == "/metrics":
        return await call_next(request)
    
    method = request.method
    endpoint = request.url.path
    
    # Track in-progress requests
    http_requests_in_progress.labels(method=method, endpoint=endpoint).inc()
    
    # Start timer
    start_time = time.time()
    
    try:
        # Process request
        response = await call_next(request)
        
        # Record metrics
        duration = time.time() - start_time
        status_code = response.status_code
        
        http_requests_total.labels(
            method=method,
            endpoint=endpoint,
            status_code=status_code
        ).inc()
        
        http_request_duration_seconds.labels(
            method=method,
            endpoint=endpoint
        ).observe(duration)
        
        return response
        
    except Exception as e:
        # Record error metrics
        duration = time.time() - start_time
        
        http_requests_total.labels(
            method=method,
            endpoint=endpoint,
            status_code=500
        ).inc()
        
        http_request_duration_seconds.labels(
            method=method,
            endpoint=endpoint
        ).observe(duration)
        
        raise
        
    finally:
        # Decrement in-progress counter
        http_requests_in_progress.labels(method=method, endpoint=endpoint).dec()


def update_active_sessions(count: int):
    """
    Update the active sessions gauge.
    
    Args:
        count: Current number of active sessions
        
    Example:
        # After creating/deleting sessions
        session_count = await get_session_count()
        update_active_sessions(session_count)
    """
    active_sessions.set(count)
