# 0003. Use PgBouncer in Transaction Mode

Date: 2025-11-19T21:50:07.698425

## Status

Accepted

## Context

We need connection pooling for PostgreSQL to handle multiple concurrent connections efficiently. The backend application creates database connections for each request, which can exhaust PostgreSQL's connection limit and impact performance.

Connection pooling solutions must:
- Reduce connection overhead to PostgreSQL
- Support our SQLAlchemy/SQLModel usage patterns
- Be compatible with our transaction patterns
- Provide good performance characteristics
- Be easy to deploy and configure

## Decision

We will use PgBouncer in transaction pooling mode as the connection pooler between the backend application and PostgreSQL.

PgBouncer in transaction mode provides:
- **Connection Pooling**: Reuses PostgreSQL connections across multiple client connections
- **Transaction Mode**: Returns connections to pool after each transaction completes
- **Compatibility**: Works with most ORMs including SQLAlchemy without special configuration
- **Performance**: Minimal overhead with efficient connection management
- **Simplicity**: Easy to configure and deploy as a sidecar container
- **Resource Efficiency**: Reduces PostgreSQL connection count significantly

## Consequences

### Positive

- Significantly reduces number of PostgreSQL connections needed
- Improves application performance by reducing connection establishment overhead
- Allows backend to scale horizontally without exhausting PostgreSQL connections
- Transaction mode is compatible with SQLAlchemy's session management
- Minimal configuration required for standard use cases
- Low memory footprint and CPU overhead

### Negative

- Transaction mode does not support:
  - Prepared statements across transactions
  - LISTEN/NOTIFY PostgreSQL features
  - Advisory locks held across transactions
  - Session-level temporary tables
- Adds another component to the infrastructure stack
- Requires monitoring of both PgBouncer and PostgreSQL connections

### Neutral

- Backend application must use transaction-scoped sessions (already a best practice)
- Connection string points to PgBouncer instead of PostgreSQL directly
- Need to configure appropriate pool size based on workload
- PgBouncer metrics should be monitored alongside PostgreSQL metrics

## Alternatives Considered

### Session Pooling Mode
- Rejected: Requires client to explicitly release connections, incompatible with SQLAlchemy patterns
- Would provide better support for prepared statements but at cost of complexity

### Statement Pooling Mode
- Rejected: Too restrictive, doesn't support multi-statement transactions
- Not suitable for typical web application patterns

### No Connection Pooling
- Rejected: Would limit scalability and waste PostgreSQL resources
- Connection establishment overhead would impact performance
