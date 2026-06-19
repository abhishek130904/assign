# Internship Assignment Submission — Full-Stack Mobile Authentication App

**Submitted by:** Abhishek Raj  
**Date:** 20 June 2026  
**GitHub Repository:** https://github.com/abhishek130904/assign

---

## Live Links

| Resource | URL |
|----------|-----|
| **Backend API** | https://assign-tfx3.onrender.com |
| **Admin Dashboard** | https://assign-admin.vercel.app |
| **APK Download** | *(EAS Build link — paste here)* |
| **IPA** | Not available — requires Apple Developer account ($99/yr) |

> **Note:** Backend is on Render free tier. First request may take 30–50s (cold start). Subsequent requests are instant.

---

## Test Credentials

| Account | Email | Password |
|---------|-------|----------|
| Admin | admin@test.com | AdminPassword123 |
| Regular User | *(Register a new user via the APK to test the full OTP flow)* | |

---

## Application Overview

A production-grade mobile authentication application demonstrating secure user management, MFA, and admin controls.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native (Expo SDK 54) + expo-router |
| Backend API | Node.js + Express.js |
| Database | MongoDB Atlas |
| Admin Dashboard | React + Vite + TypeScript |
| Email Service | Brevo (Sendinblue) |
| Hosting | Render (backend), Vercel (admin), EAS Build (APK) |

---

## Authentication & Security Architecture

### 1. User Registration + OTP Verification
- User registers with name, email, password
- 6-digit OTP generated via `crypto.randomInt` and sent via Brevo email
- OTP stored in MongoDB with **10-minute TTL index** (auto-deleted by Atlas)
- On successful verification → **auto-login** (JWT tokens issued immediately)
- Rate limited: max 3 OTP resends per hour per email

### 2. Login with MFA (Multi-Factor Authentication)
- User enters email + password → validated against bcrypt-12 hash
- If valid → **login OTP sent to email** (second factor)
- User enters OTP → tokens issued, session created
- Admin users bypass MFA for dashboard compatibility

### 3. JWT Token Architecture
- **Access Token:** 15-minute expiry, stored in React Context (memory only — never persisted)
- **Refresh Token:** 7-day expiry, stored in `expo-secure-store` (AES-256 encrypted on device)
- **Token Rotation:** Each refresh request issues a new token pair and revokes the old one
- **All tokens SHA-256 hashed** before database storage

### 4. Password Reset
- 32-byte random hex token, SHA-256 hashed before storage
- Reset link includes deep link (`yourapp://`) + web fallback
- On reset, **all existing refresh tokens are revoked** for security

### 5. Security Measures
| Measure | Implementation |
|---------|---------------|
| Password Hashing | bcrypt (12 rounds) |
| HTTP Security Headers | helmet.js |
| NoSQL Injection Prevention | express-mongo-sanitize |
| Rate Limiting | express-rate-limit (10 req/15min on auth routes) |
| Input Validation | express-validator |
| Token Storage | SHA-256 hashed in DB |
| CORS | Whitelist-based with Vercel/Render auto-allow |
| Proxy Trust | Configured for Render reverse proxy |

### 6. Database Design
- **MongoDB TTL Indexes** on OtpToken, RefreshToken, and PasswordResetToken — automatic cleanup with zero cron jobs
- Indexes on email + purpose for fast OTP lookups
- User model with role-based access control (user/admin)

---

## Admin Dashboard Features
- Secure admin-only login (role check enforced)
- Dashboard stats: total users, verified users, active sessions
- User management: search, filter by role/status, pagination
- Toggle user active/inactive status
- Change user roles
- View per-user active session count
- Premium dark-mode UI with glassmorphism design

---

## Mobile App Features
- Premium dark-indigo themed UI with Feather icons
- Registration with real-time validation
- OTP input with auto-focus between digits
- Login MFA with security code verification
- Dashboard with profile info and role badges
- Forgot password + reset flow
- Secure logout with token revocation
- Pull-to-refresh and loading states

---

## Project Structure

```
assign/
├── backend/          # Node.js + Express REST API
│   ├── src/
│   │   ├── controllers/   # Auth, User, Admin controllers
│   │   ├── models/        # User, OtpToken, RefreshToken, PasswordResetToken
│   │   ├── middlewares/   # Auth, rate limiter, error handler
│   │   ├── routes/        # Auth, User, Admin routes
│   │   ├── utils/         # Token generation, email sending
│   │   └── scripts/       # Admin seeding script
│   └── app.js
├── mobile/           # React Native (Expo) mobile app
│   ├── app/
│   │   ├── (auth)/        # Login, Register, Verify, Forgot/Reset password
│   │   └── (app)/         # Dashboard (protected)
│   └── src/
│       ├── api/           # API client with interceptors
│       ├── components/    # FormInput, PrimaryButton, OtpInput
│       └── context/       # AuthContext (token management)
└── admin/            # React + Vite admin dashboard
    └── src/
        ├── pages/         # Login, Stats, Users, UserDetail
        ├── context/       # AdminAuthContext
        └── api/           # Admin API client
```

---

## How to Run Locally

### Backend
```bash
cd backend
npm install
cp .env.example .env   # Configure environment variables
npm run dev
```

### Mobile
```bash
cd mobile
npm install
npx expo start
```

### Admin
```bash
cd admin
npm install
npm run dev
```

---

*Thank you for the opportunity. I look forward to hearing from you.*
