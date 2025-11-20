# 0004. Use Traefik for Ingress

Date: 2025-11-19T21:50:07.698425

## Status

Accepted

## Context

We need a reverse proxy and ingress solution for the monorepo that:
- Routes traffic to backend and frontend services
- Provides automatic HTTPS with Let's Encrypt
- Integrates seamlessly with Docker Compose
- Supports dynamic service discovery
- Exposes metrics for monitoring
- Requires minimal manual configuration

## Decision

We will use Traefik v3 as the ingress controller and reverse proxy.

Traefik provides:
- **Automatic HTTPS**: Built-in ACME protocol support for Let's Encrypt certificate automation
- **Docker Integration**: Native Docker provider with automatic service discovery via labels
- **Dynamic Configuration**: Automatically detects and configures new services without restarts
- **Metrics**: Built-in Prometheus metrics endpoint
- **Middleware**: Rich middleware system for headers, rate limiting, authentication, etc.
- **Dashboard**: Web UI for monitoring and debugging routing configuration
- **HTTP/2 and HTTP/3**: Modern protocol support out of the box

## Consequences

### Positive

- Zero-touch HTTPS with automatic certificate renewal via Let's Encrypt
- Service configuration via Docker labels eliminates separate config files
- Automatic service discovery reduces deployment complexity
- Built-in metrics integrate seamlessly with Prometheus
- HTTP to HTTPS redirect configured automatically
- Dashboard provides visibility into routing configuration
- Active development and strong community support

### Negative

- Traefik-specific label syntax must be learned by team
- Configuration is distributed across docker-compose.yml labels
- Debugging routing issues requires understanding Traefik's routing logic
- Dashboard should be secured in production environments
- ACME certificate storage requires persistent volume

### Neutral

- Requires port 80 and 443 to be available on host
- ACME HTTP challenge requires domain to resolve to server
- Certificate storage in acme.json file needs backup strategy
- Traefik configuration split between static (traefik.yml) and dynamic (labels)

## Alternatives Considered

### Nginx
- Rejected: Requires manual certificate management or separate certbot setup
- No native Docker service discovery
- Configuration changes require reload/restart
- Would require more manual configuration

### Caddy
- Considered: Also provides automatic HTTPS
- Rejected: Less mature Docker integration compared to Traefik
- Smaller ecosystem and community
- Configuration via Caddyfile less flexible than Traefik labels

### HAProxy
- Rejected: No built-in ACME/Let's Encrypt support
- Requires external certificate management
- Less intuitive Docker integration
- More complex configuration for our use case

### Cloud Load Balancer (AWS ALB, etc.)
- Rejected: Adds cloud provider dependency
- Increases infrastructure cost
- Not suitable for local development and self-hosted deployments
- Would require different setup for development vs production
