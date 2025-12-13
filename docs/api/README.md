# API Documentation

## Overview

The eno_inventory backend provides a RESTful API built with FastAPI. All API endpoints are namespaced under `/api/v1/` and return JSON responses.

## Base URL

- **Production**: `https://test.example.com/api/v1`
- **Development**: `http://localhost:8000/api/v1`

## Authentication

Session-based authentication using opaque tokens stored in Redis.

### Session Flow

1. **Login**: POST to `/api/v1/auth/login` with credentials
2. **Response**: Receive session token in response
3. **Subsequent Requests**: Include token in `Authorization` header
4. **Logout**: POST to `/api/v1/auth/logout` to invalidate session

### Headers

```
Authorization: Bearer <session_token>
Content-Type: application/json
```

## OpenAPI Documentation

The API automatically generates interactive documentation:

### Swagger UI
Interactive API documentation with request/response examples and testing interface.

**URL**: `https://test.example.com/api/docs`

Features:
- Browse all endpoints
- View request/response schemas
- Test endpoints directly in browser
- See authentication requirements

### ReDoc
Alternative documentation with a clean, three-panel design.

**URL**: `https://test.example.com/api/redoc`

Features:
- Clean, readable layout
- Detailed schema documentation
- Code samples
- Search functionality

### OpenAPI Specification
Raw OpenAPI 3.0 specification in JSON format.

**URL**: `https://test.example.com/api/openapi.json`

Use this for:
- Generating client SDKs
- Importing into API tools (Postman, Insomnia)
- Automated testing
- Documentation generation

## Core Endpoints

### Health Check

Check if the API is running and healthy.

**Endpoint**: `GET /api/v1/health`

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Version Information

Get application version, git commit, and build information.

**Endpoint**: `GET /api/v1/version`

**Response**:
```json
{
  "version": "0.1.0",
  "commit": "dev",
  "build_date": "2025-11-19T21:50:07.698425"
}
```

**Use Cases**:
- Verify deployed version
- Debug deployment issues
- Track releases

## Response Format

### Success Response

```json
{
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error details
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "trace_id": "abc123..."
  }
}
```

## HTTP Status Codes

The API uses standard HTTP status codes:

### Success Codes
- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `204 No Content`: Request succeeded with no response body

### Client Error Codes
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error

### Server Error Codes
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service temporarily unavailable

## Rate Limiting

Rate limiting is enforced to prevent abuse:

- **Limit**: 100 requests per minute per IP
- **Headers**: Rate limit info in response headers
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time when limit resets

**Rate Limit Exceeded Response**:
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retry_after": 60
    }
  }
}
```

## Pagination

List endpoints support pagination using cursor-based pagination:

**Query Parameters**:
- `limit`: Number of items per page (default: 20, max: 100)
- `cursor`: Cursor for next page (from previous response)

**Request**:
```
GET /api/v1/items?limit=20&cursor=abc123
```

**Response**:
```json
{
  "data": [
    // Items
  ],
  "meta": {
    "has_more": true,
    "next_cursor": "xyz789",
    "total": 150
  }
}
```

## Filtering and Sorting

List endpoints support filtering and sorting:

**Query Parameters**:
- `filter[field]`: Filter by field value
- `sort`: Sort field (prefix with `-` for descending)

**Examples**:
```
GET /api/v1/items?filter[status]=active&sort=-created_at
GET /api/v1/items?filter[category]=tech&filter[published]=true
```

## Validation

Request validation is performed using Pydantic models. Validation errors return detailed information:

**Validation Error Response**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "errors": [
        {
          "field": "email",
          "message": "Invalid email format",
          "type": "value_error.email"
        }
      ]
    }
  }
}
```

## CORS

Cross-Origin Resource Sharing (CORS) is configured to allow requests from the frontend domain.

**Allowed Origins**:
- `https://test.example.com`
- `http://localhost:3000` (development)

**Allowed Methods**: GET, POST, PUT, PATCH, DELETE, OPTIONS

**Allowed Headers**: Authorization, Content-Type

## Webhooks

(If applicable) The API can send webhooks for specific events.

**Webhook Format**:
```json
{
  "event": "event.name",
  "data": {
    // Event data
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "signature": "hmac-sha256-signature"
}
```

## Client SDKs

### Generating Client SDKs

Use the OpenAPI specification to generate client SDKs:

**TypeScript/JavaScript**:
```bash
npx openapi-typescript-codegen --input https://test.example.com/api/openapi.json --output ./src/api
```

**Python**:
```bash
openapi-generator-cli generate -i https://test.example.com/api/openapi.json -g python -o ./client
```

### Example Usage

**TypeScript**:
```typescript
import { ApiClient } from '@/lib/api-client';

const client = new ApiClient('https://test.example.com/api/v1');

// Get version
const version = await client.get('/version');
console.log(version.data);
```

**Python**:
```python
import requests

response = requests.get('https://test.example.com/api/v1/version')
data = response.json()
print(data)
```

## Testing

### Using Swagger UI

1. Navigate to `https://test.example.com/api/docs`
2. Click on an endpoint to expand
3. Click "Try it out"
4. Fill in parameters
5. Click "Execute"
6. View response

### Using cURL

```bash
# Get version
curl https://test.example.com/api/v1/version

# With authentication
curl -H "Authorization: Bearer <token>" \
     https://test.example.com/api/v1/protected-endpoint

# POST request
curl -X POST \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <token>" \
     -d '{"key": "value"}' \
     https://test.example.com/api/v1/endpoint
```

### Using Postman

1. Import OpenAPI spec: `https://test.example.com/api/openapi.json`
2. Set base URL: `https://test.example.com/api/v1`
3. Configure authentication in collection settings
4. Test endpoints

## Monitoring

### Metrics

Prometheus metrics are exposed at `/metrics`:

**URL**: `http://backend:8000/metrics`

**Available Metrics**:
- `http_requests_total`: Total HTTP requests
- `http_request_duration_seconds`: Request duration histogram
- `active_sessions`: Number of active sessions
- `database_connections`: Database connection pool stats

### Health Checks

Monitor API health:

```bash
# Basic health check
curl https://test.example.com/api/v1/health

# Detailed health check (if implemented)
curl https://test.example.com/api/v1/health/detailed
```

## Best Practices

### Client Implementation

1. **Error Handling**: Always handle error responses
2. **Retries**: Implement exponential backoff for retries
3. **Timeouts**: Set appropriate request timeouts
4. **Rate Limiting**: Respect rate limits and retry after headers
5. **Caching**: Cache responses when appropriate
6. **Logging**: Log requests for debugging

### Security

1. **HTTPS Only**: Always use HTTPS in production
2. **Token Storage**: Store tokens securely (not in localStorage)
3. **Token Refresh**: Implement token refresh logic
4. **Input Validation**: Validate input on client side
5. **Sensitive Data**: Never log sensitive data

## Troubleshooting

### Common Issues

**401 Unauthorized**:
- Check token is valid and not expired
- Verify Authorization header format
- Ensure token is included in request

**422 Validation Error**:
- Check request body matches schema
- Verify all required fields are present
- Check data types match schema

**500 Internal Server Error**:
- Check server logs for details
- Verify database connectivity
- Check Redis connectivity

### Getting Help

- **Swagger UI**: Use interactive docs for testing
- **Logs**: Check application logs for errors
- **Support**: Contact development team

## Changelog

API changes are documented in the main project CHANGELOG.md file.

### Versioning

The API follows semantic versioning:
- **Major version** (v1, v2): Breaking changes
- **Minor updates**: New features (backward compatible)
- **Patches**: Bug fixes (backward compatible)

Current version: **v1**

## Additional Resources

- [Main Documentation](../README.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
- [Backend README](../../backend/README.md)
- [OpenAPI Specification](https://test.example.com/api/openapi.json)
