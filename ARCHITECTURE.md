# Architecture Plan

## 1. Folder Structure (Monorepo)

```
/assi
  /backend
    /src
      /config       db.js, email.js
      /models       User.js, OtpToken.js, RefreshToken.js, PasswordResetToken.js
      /controllers  auth.controller.js, user.controller.js, admin.controller.js
      /routes       auth.routes.js, user.routes.js, admin.routes.js
      /middlewares  auth.middleware.js, admin.middleware.js, rateLimiter.js, errorHandler.js
      /utils        generateOtp.js, generateTokens.js, sendEmail.js
      /validators   auth.validator.js
      /scripts      seedAdmin.js
    app.js  server.js  .env.example  package.json
  /mobile
    /app            expo-router screens
    /src            api, context, hooks, components
    /constants      Colors.ts
    app.json  eas.json  .env
  /admin
    /src            api, context, pages, components, styles
    main.tsx  App.tsx  .env
```

## 2. MongoDB Schemas

### User
| Field | Type | Notes |
|-------|------|-------|
| name | String | required, trim |
| email | String | unique, lowercase, indexed |
| password | String | bcrypt hashed |
| role | String | enum: user/admin, default: user |
| isEmailVerified | Boolean | default: false |
| isActive | Boolean | default: true |
| timestamps | — | createdAt, updatedAt |

### OtpToken
| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId | ref: User |
| email | String | for pre-verification lookup |
| otp | String | 6-digit |
| purpose | String | email_verification / password_reset |
| expiresAt | Date | TTL index (auto-delete) |
| createdAt | Date | — |

### RefreshToken
| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId | ref: User |
| tokenHash | String | SHA-256 of raw token |
| expiresAt | Date | TTL index (7 days) |
| isRevoked | Boolean | default: false |
| createdAt | Date | — |

### PasswordResetToken
| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId | ref: User |
| tokenHash | String | SHA-256 of raw token |
| expiresAt | Date | TTL index (15 min) |
| isUsed | Boolean | default: false |

## 3. API Endpoints

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | /api/auth/register | No | Register user, send OTP |
| POST | /api/auth/verify-email | No | Verify OTP |
| POST | /api/auth/resend-otp | No | Resend OTP (rate limited) |
| POST | /api/auth/login | No | Login, return tokens |
| POST | /api/auth/refresh-token | No | Rotate refresh token |
| POST | /api/auth/logout | No | Revoke refresh token |
| POST | /api/auth/forgot-password | No | Send reset email |
| POST | /api/auth/reset-password | No | Reset password |
| GET | /api/user/me | Yes | Get current user |
| GET | /api/admin/users | Admin | List users (paginated) |
| GET | /api/admin/users/:id | Admin | User detail |
| PATCH | /api/admin/users/:id/toggle-active | Admin | Toggle active |
| PATCH | /api/admin/users/:id/change-role | Admin | Change role |
| GET | /api/admin/stats | Admin | Dashboard stats |
| GET | /api/health | No | Health check |

## 4. Token Storage Strategy (Mobile)

- **Access Token**: React Context (in-memory). Lost on app restart → refresh flow re-fetches it.
- **Refresh Token**: `expo-secure-store` → AES-256 encrypted on device.
- **Why NOT AsyncStorage**: AsyncStorage is unencrypted. Tokens stored there can be extracted from rooted devices.

## 5. Security Checklist

- bcrypt: 12 rounds
- Rate limiting: 10 req/15min per IP on auth routes, 100 req/15min globally
- helmet: sets secure HTTP headers
- cors: whitelist only known origins
- express-mongo-sanitize: prevents NoSQL injection
- express-validator: input validation on all endpoints
- Token hashing: refresh + reset tokens stored as SHA-256 hash, never plaintext
- OTP: not returned in API response, server-side only
