# Authentication System Documentation

## Overview

The application implements a secure authentication system with user registration, login, and JWT-based session management. Passwords are hashed using bcrypt with salt for maximum security.

## Security Features

### Password Hashing

- **Algorithm:** bcrypt with auto-generated salt
- **Salt Rounds:** 10 (2^10 = 1024 iterations)
- **Storage:** 
  - `password_hash` - Bcrypt hash (includes salt internally)
  - `password_salt` - Separate salt storage for additional security layer
- **Hash Format:** Bcrypt produces a 60-character hash string

### JWT Tokens

- **Algorithm:** HS256 (HMAC with SHA-256)
- **Expiration:** 7 days
- **Payload:** `{ userId: number, email: string }`
- **Secret:** Configurable via `JWT_SECRET` environment variable

## API Endpoints

### 1. Register User

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123"
}
```

**Validation:**
- Name, email, and password are required
- Password must be at least 6 characters
- Email must be valid format (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- Email must be unique (not already registered)

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Validation errors (missing fields, invalid format, weak password)
- `409` - Email already exists
- `500` - Server error

### 2. Login User

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "secure123"
}
```

**Validation:**
- Email and password are required
- Credentials must match registered user

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Missing email or password
- `401` - Invalid credentials
- `500` - Server error

### 3. Get Current User

**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2026-02-27T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `401` - Invalid or expired token, or missing Authorization header
- `500` - Server error

## Database Schema

### Updated `user` Table

```sql
CREATE TABLE "user" (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(100) NOT NULL,
  email           VARCHAR(100) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  password_salt   VARCHAR(255) NOT NULL,
  created_at      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX user_email_key ON "user"(email);
```

### Migration Changes

From:
```sql
name     VARCHAR(40)
email    VARCHAR(40)
password VARCHAR(40)
```

To:
```sql
name          VARCHAR(100)
email         VARCHAR(100) UNIQUE
password_hash VARCHAR(255)
password_salt VARCHAR(255)
created_at    TIMESTAMP(3) DEFAULT now()
updated_at    TIMESTAMP(3) DEFAULT now()
```

## Authentication Flow

### Registration Process

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant AuthService
    participant bcrypt
    participant DB
    participant JWT

    Client->>API: POST /auth/register<br/>{name, email, password}
    API->>API: Validate input<br/>(length, format, required)
    API->>AuthService: registerUser(data)
    AuthService->>DB: Check if email exists
    
    alt Email exists
        DB-->>AuthService: User found
        AuthService-->>API: Error: Email exists
        API-->>Client: 409 Conflict
    else Email available
        DB-->>AuthService: No user found
        AuthService->>bcrypt: genSalt(10)
        bcrypt-->>AuthService: Salt generated
        AuthService->>bcrypt: hash(password, salt)
        bcrypt-->>AuthService: Hashed password
        AuthService->>DB: INSERT user<br/>(name, email, hash, salt)
        DB-->>AuthService: User created
        AuthService->>JWT: sign({userId, email})
        JWT-->>AuthService: Token
        AuthService-->>API: {user, token}
        API-->>Client: 201 Created<br/>{user, token}
    end
```

### Login Process

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant AuthService
    participant DB
    participant bcrypt
    participant JWT

    Client->>API: POST /auth/login<br/>{email, password}
    API->>API: Validate input
    API->>AuthService: loginUser(data)
    AuthService->>DB: SELECT user WHERE email
    
    alt User not found
        DB-->>AuthService: null
        AuthService-->>API: Error: Invalid credentials
        API-->>Client: 401 Unauthorized
    else User found
        DB-->>AuthService: User data (with hash)
        AuthService->>bcrypt: compare(password, hash)
        
        alt Password incorrect
            bcrypt-->>AuthService: false
            AuthService-->>API: Error: Invalid credentials
            API-->>Client: 401 Unauthorized
        else Password correct
            bcrypt-->>AuthService: true
            AuthService->>JWT: sign({userId, email})
            JWT-->>AuthService: Token
            AuthService-->>API: {user, token}
            API-->>Client: 200 OK<br/>{user, token}
        end
    end
```

### Protected Route Access

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Middleware
    participant JWT
    participant Handler

    Client->>API: GET /orders<br/>Authorization: Bearer <token>
    API->>Middleware: authMiddleware
    Middleware->>Middleware: Extract token from header
    
    alt No token or invalid format
        Middleware-->>Client: 401 No token provided
    else Token present
        Middleware->>JWT: verify(token, secret)
        
        alt Token invalid/expired
            JWT-->>Middleware: Error
            Middleware-->>Client: 401 Invalid token
        else Token valid
            JWT-->>Middleware: {userId, email}
            Middleware->>Middleware: Set req.userId, req.userEmail
            Middleware->>Handler: next()
            Handler->>Handler: Use req.userId
            Handler-->>Client: 200 OK + data
        end
    end
```

## Middleware Implementation

### authMiddleware

Required authentication - returns 401 if no valid token

```typescript
import { authMiddleware } from './src/middleware/auth.js';

app.post('/orders', authMiddleware, async (req: AuthRequest, res: Response) => {
  // req.userId is available here
  const order = await createOrder({ user_id: req.userId, ... });
});
```

### optionalAuthMiddleware

Optional authentication - continues even without token

```typescript
import { optionalAuthMiddleware } from './src/middleware/auth.js';

app.get('/public-data', optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  // req.userId may or may not be set
  if (req.userId) {
    // Show personalized data
  } else {
    // Show public data
  }
});
```

## Protected Endpoints

The following endpoints now require authentication:

### Orders

- `POST /orders` - Create order (uses authenticated user's ID)
- `GET /orders` - List orders (shows only authenticated user's orders)
- `POST /orders/import` - Import orders (assigns to authenticated user)

**Previous behavior:**
```javascript
// Required user_id in body
{ user_id: 1, subtotal: 100, ... }
```

**New behavior:**
```javascript
// Uses req.userId from JWT token
{ subtotal: 100, longitude: -73.9857, latitude: 40.7484 }
```

## Frontend Integration

### Storing Token

```typescript
// After successful login/register
localStorage.setItem('authToken', response.token);
localStorage.setItem('user', JSON.stringify(response.user));
```

### Making Authenticated Requests

```typescript
const token = localStorage.getItem('authToken');

fetch('http://localhost:3000/orders', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### API Client Update

```typescript
// src/api/client.ts
export const fetchApi = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('authToken');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    const error = await response.json();
    throw new ApiError(error.error || 'Request failed', response.status, error);
  }

  return response.json();
};
```

### Login Component Example

```typescript
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await api.auth.login({ email, password });
    
    // Store token and user data
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    // Redirect to dashboard
    navigate('/dashboard');
  } catch (error) {
    setError(error.message);
  }
};
```

### Register Component Example

```typescript
const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (password !== confirmPassword) {
    setError('Passwords do not match');
    return;
  }
  
  try {
    const response = await api.auth.register({ name, email, password });
    
    // Store token and user data
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    // Redirect to dashboard
    navigate('/dashboard');
  } catch (error) {
    setError(error.message);
  }
};
```

### Protected Route Component

```typescript
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};
```

## Security Best Practices

### Password Requirements

✅ Minimum 6 characters (increase to 8+ in production)
✅ No maximum length (bcrypt handles long passwords)
✅ Email validation with regex
✅ Unique email constraint in database

### Token Security

✅ Short expiration time (7 days - adjust as needed)
✅ HTTPS only in production (prevents token interception)
✅ HttpOnly cookies (alternative to localStorage - more secure)
✅ Refresh token mechanism (implement for better UX)

### Password Hashing

✅ bcrypt with salt rounds 10
✅ Each password has unique salt
✅ Salt stored separately for additional security layer
✅ Passwords never logged or exposed in responses

### Rate Limiting

⚠️ TODO: Implement rate limiting for login attempts
⚠️ TODO: Add CAPTCHA for repeated failed logins
⚠️ TODO: Account lockout after N failed attempts

## Environment Variables

Create `.env` file in backend:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-key-change-this-in-production-use-long-random-string
JWT_EXPIRES_IN=7d

# Database Connection (existing)
DATABASE_URL=postgresql://user:password@host:port/database

# Optional: bcrypt cost factor (default: 10)
BCRYPT_ROUNDS=10
```

**Important:** Never commit `.env` file to git! Add to `.gitignore`.

## Testing

### Manual Testing with curl

**Register:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get User (with token):**
```bash
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Create Order (with token):**
```bash
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subtotal": 100,
    "longitude": -73.9857,
    "latitude": 40.7484
  }'
```

## Troubleshooting

### Common Errors

**"User with this email already exists"**
- Email is already registered
- Use different email or login instead

**"Invalid email or password"**
- Credentials don't match
- Check email spelling and password

**"No token provided"**
- Missing Authorization header
- Token not formatted as "Bearer <token>"

**"Invalid or expired token"**
- Token expired (>7 days old)
- Token signature invalid
- JWT_SECRET changed after token generation
- Login again to get new token

**"Password must be at least 6 characters long"**
- Password too short
- Use longer password

## Migration from Old System

If you have existing users with plain text passwords:

1. **Option 1: Force password reset**
   - Send password reset emails to all users
   - Let them set new hashed passwords

2. **Option 2: Hash on next login**
   - Keep old password column temporarily
   - On login, if password_hash is null, hash the password
   - Update user record with hashed password
   - Remove old column after all users migrated

3. **Option 3: Bulk migration script**
   - Run script to hash all existing passwords
   - Set generic salt for old passwords
   - Force users to change password on next login

## Future Enhancements

### Recommended Features

1. **Refresh Tokens**
   - Long-lived refresh token (30 days)
   - Short-lived access token (15 minutes)
   - Token refresh endpoint

2. **Password Reset**
   - Email-based password reset
   - Temporary reset tokens
   - Link expiration (1 hour)

3. **Email Verification**
   - Send verification email on registration
   - Verify email before allowing login
   - Resend verification link

4. **Two-Factor Authentication (2FA)**
   - TOTP (Time-based One-Time Password)
   - SMS verification
   - Backup codes

5. **OAuth Integration**
   - Google Sign-In
   - GitHub OAuth
   - Social login providers

6. **Session Management**
   - View active sessions
   - Logout from all devices
   - Device tracking

7. **Account Security**
   - Password change endpoint
   - Login history
   - Suspicious activity alerts

## References

- **bcrypt Documentation:** https://www.npmjs.com/package/bcrypt
- **JWT Documentation:** https://jwt.io/
- **OWASP Password Storage:** https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- **Express Security Best Practices:** https://expressjs.com/en/advanced/best-practice-security.html
