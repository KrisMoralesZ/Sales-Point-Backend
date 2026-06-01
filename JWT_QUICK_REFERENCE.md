# JWT Authentication Implementation - Quick Reference

## ✅ What's Been Set Up

### 1. **JWT Packages Installed**
- `@nestjs/jwt` - JWT token generation and validation
- `@nestjs/passport` - Passport.js integration
- `passport` - Authentication middleware
- `passport-jwt` - JWT strategy for Passport

### 2. **Created Files**

#### Authentication Strategy
- `src/common/strategies/jwt.strategy.ts` - Extracts and validates JWT tokens
- `src/common/guards/jwt-auth.guard.ts` - Base JWT guard
- `src/common/guards/global-jwt-auth.guard.ts` - Global JWT guard with public route support
- `src/common/guards/admin.guard.ts` - Admin-only guard (extends JWT)

#### Decorators
- `src/common/decorators/admin.decorator.ts` - Apply admin protection
- `src/common/decorators/current-user.decorator.ts` - Inject current user
- `src/common/decorators/public.decorator.ts` - Mark routes as public

#### Modules
- `src/jwt-auth/jwt-auth.module.ts` - JWT configuration module
- Updated `src/authentication/authentication.module.ts` - Added JWT support

#### Type Definitions
- `src/types/express.d.ts` - Express Request augmentation for User type

### 3. **Authentication Service Updates**
- `src/authentication/authentication.service.ts` - Added `login()` method with password verification
- `src/authentication/authentication.controller.ts` - Added `POST /authentication/login` endpoint

### 4. **Products Security**
- ✅ `POST /products` - Admin only
- ✅ `PATCH /products/:id` - Admin only
- ✅ `DELETE /products/:id` - Admin only
- ✅ `GET /products` - Public
- ✅ `GET /products/:id` - Public

## 📝 Environment Configuration

Add to your `.env` file:
```env
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRATION=24h
```

See `.env.example` for reference.

## 🔄 Authentication Flow

### 1. User Registers
```bash
POST /authentication/register
{
  "name": "John Admin",
  "email": "admin@example.com",
  "password": "password123",
  "role": "Admin"
}
```

### 2. User Logs In
```bash
POST /authentication/login
{
  "email": "admin@example.com",
  "password": "password123"
}

Response:
{
  "id": "uuid",
  "name": "John Admin",
  "email": "admin@example.com",
  "role": "Admin",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Use Token for Protected Routes
```bash
POST /products
Authorization: Bearer <token>
{
  "name": "New Product",
  "price": 99.99
}
```

## 🛡️ Route Protection Levels

### Public Routes (No Auth Required)
```typescript
@Get()
@Public()
findAll()
```

### Authenticated Routes (JWT Required)
```typescript
@Get(':id')
findOne()  // No guard needed - user is automatically extracted
```

### Admin-Only Routes (JWT + Admin Role Required)
```typescript
@Post()
@Admin()
create()
```

## 💡 Using Current User in Handlers

```typescript
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;  // User is the authenticated user from JWT
}
```

## 🔐 Security Features

1. **Global JWT Guard** - All routes require JWT by default
2. **Public Routes** - Use `@Public()` to skip JWT validation
3. **Admin Guard** - Validates JWT + Admin role
4. **Role-Based Access** - User role is included in JWT payload
5. **Password Hashing** - Uses bcrypt for password security
6. **Type-Safe** - Full TypeScript support with Express Request augmentation

## 📚 Key Files to Remember

| File | Purpose |
|------|---------|
| `src/common/strategies/jwt.strategy.ts` | JWT token validation |
| `src/common/guards/admin.guard.ts` | Admin authorization |
| `src/authentication/authentication.service.ts` | Login & token generation |
| `src/jwt-auth/jwt-auth.module.ts` | JWT configuration |
| `.env` | JWT_SECRET configuration |

## ⚠️ Production Checklist

- [ ] Change `JWT_SECRET` to a strong, random value
- [ ] Set `JWT_EXPIRATION` to appropriate value (24h is default)
- [ ] Use HTTPS in production
- [ ] Consider implementing refresh tokens
- [ ] Store tokens securely on client (HttpOnly cookies preferred)
- [ ] Implement token revocation if needed
- [ ] Add rate limiting to login endpoint
- [ ] Monitor and log authentication failures

## 🧪 Testing

To test the authentication:

1. Register a user:
```bash
curl -X POST http://localhost:3000/authentication/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"test123","role":"Admin"}'
```

2. Login:
```bash
curl -X POST http://localhost:3000/authentication/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"test123"}'
```

3. Use the token to create a product:
```bash
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Product","price":99.99}'
```

4. Public route (no token needed):
```bash
curl http://localhost:3000/products
```
