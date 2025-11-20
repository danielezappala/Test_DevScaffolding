"""JSON structured logging configuration"""

import json
import logging
import sys
import time
from typing import Any

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings


class JSONFormatter(logging.Formatter):
    """
    Custom JSON formatter for structured logging.
    
    Outputs log records as JSON objects for easy parsing and analysis.
    """
    
    def format(self, record: logging.LogRecord) -> str:
        """
        Format log record as JSON.
        
        Args:
            record: Log record to format
            
        Returns:
            JSON string representation of log record
        """
        log_data = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        # Add extra fields
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id
        
        if hasattr(record, "user_id"):
            log_data["user_id"] = record.user_id
        
        # Add any custom fields from extra parameter
        for key, value in record.__dict__.items():
            if key not in [
                "name", "msg", "args", "created", "filename", "funcName",
                "levelname", "levelno", "lineno", "module", "msecs",
                "message", "pathname", "process", "processName",
                "relativeCreated", "thread", "threadName", "exc_info",
                "exc_text", "stack_info", "request_id", "user_id"
            ]:
                log_data[key] = value
        
        return json.dumps(log_data)


def setup_logging():
    """
    Configure application logging with JSON formatting.
    
    Sets up root logger with JSON formatter and appropriate log level.
    """
    # Create JSON formatter
    formatter = JSONFormatter(
        datefmt="%Y-%m-%dT%H:%M:%S"
    )
    
    # Configure handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))
    root_logger.handlers = [handler]
    
    # Reduce noise from third-party libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)


async def log_request_middleware(request: Request, call_next):
    """
    Middleware for logging HTTP requests and responses.
    
    Logs request method, path, status code, and duration in JSON format.
    
    Args:
        request: Incoming HTTP request
        call_next: Next middleware/handler in chain
        
    Returns:
        HTTP response
    """
    # Generate request ID
    request_id = request.headers.get("X-Request-ID", f"req_{int(time.time() * 1000)}")
    
    # Start timer
    start_time = time.time()
    
    # Process request
    try:
        response = await call_next(request)
        duration = time.time() - start_time
        
        # Log request
        logger = logging.getLogger("app.http")
        logger.info(
            f"{request.method} {request.url.path} {response.status_code}",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": round(duration * 1000, 2),
                "client_ip": request.client.host if request.client else None,
            }
        )
        
        # Add request ID to response headers
        response.headers["X-Request-ID"] = request_id
        
        return response
        
    except Exception as e:
        duration = time.time() - start_time
        
        # Log error
        logger = logging.getLogger("app.http")
        logger.error(
            f"{request.method} {request.url.path} ERROR",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "duration_ms": round(duration * 1000, 2),
                "error": str(e),
            },
            exc_info=True
        )
        
        raise


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance with the specified name.
    
    Args:
        name: Logger name (typically __name__)
        
    Returns:
        Logger instance
        
    Example:
        logger = get_logger(__name__)
        logger.info("Processing request", extra={"user_id": 123})
    """
    return logging.getLogger(name)
