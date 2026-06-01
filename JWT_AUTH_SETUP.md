# JWT Authentication Setup

This guide explains how JWT authentication is configured in your NestJS application.

## Configuration

### Environment Variables

Create a `.env` file in your project root with the following JWT configuration:

```env
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRATION=24h
```

## How It Works

### 1. **Global JWT Authentication**
- All routes require JWT authentication by default
- The JWT token is extracted from the `Authorization` header as a Bearer token
- The `GlobalJwtAuthGuard` validates the token and extracts the user

### 2. **Public Routes**
- Use the `@Public()` decorator on routes that don't require authentication
- Example:
```typescript
@Post('login')
@Public()
async login(@Body() loginDto: LoginDto) {
  // No JWT required
}
```

### 3. **Admin-Only Routes**
- Use the `@Admin()` decorator on routes that only admins can access
- This guard validates the JWT token AND checks if the user role is `Admin`
- Example:
```typescript
@Post()
@Admin()
async create(@Body() createProductDto: CreateProductDto) {
  // Only admins can create products
}
```

## Authentication Flow

### Login
1. User sends POST request to `/authentication/login` with email and password
2. Service validates credentials using bcrypt
3. On success, returns user data + JWT token
4. Client stores the token (typically in localStorage)

### Accessing Protected Routes
1. Client includes JWT token in `Authorization: Bearer <token>` header
2. `GlobalJwtAuthGuard` validates the token
3. `JwtStrategy` loads the full user from the database
4. Request proceeds with `request.user` populated

### Admin Routes
1. Request includes JWT token in headers
2. `AdminGuard` extends `JwtAuthGuard` to validate JWT
3. `AdminGuard` then checks if `user.role === 'Admin'`
4. Returns 403 Forbidden if user is not an admin

## Creating Users

### Register (Admin-controlled in typical setup)
```
POST /authentication/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Admin" or "Employee"
}
```

### Login
```
POST /authentication/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Admin",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Using the Token

Include the token in all subsequent requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Available Decorators

### `@Public()`
Skip JWT authentication for the route
```typescript
@Get()
@Public()
findAll()
```

### `@Admin()`
Require JWT authentication + Admin role
```typescript
@Post()
@Admin()
create()
```

### `@CurrentUser()`
Inject the current authenticated user into the handler
```typescript
@Get('profile')
async getProfile(@CurrentUser() user: User) {
  return user;
}
```

## Products Module Authorization

- **Create Product** (`POST /products`): Admin only
- **Update Product** (`PATCH /products/:id`): Admin only  
- **Delete Product** (`DELETE /products/:id`): Admin only
- **Get All Products** (`GET /products`): Public
- **Get Product** (`GET /products/:id`): Public

## Security Best Practices

1. **JWT_SECRET**: Use a strong, random secret in production
2. **Token Expiration**: Set appropriate expiration times (default: 24h)
3. **HTTPS**: Always use HTTPS in production
4. **Refresh Tokens**: Consider implementing refresh tokens for long-lived sessions
5. **Token Storage**: Clients should store tokens securely (HttpOnly cookies preferred over localStorage)
