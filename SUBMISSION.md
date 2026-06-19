# Submission Package

## Test Credentials

**Backend API:** `https://assign-tfx3.onrender.com`  
**Admin Dashboard:** `https://[YOUR-ADMIN].vercel.app`  
**APK Download:** [EAS Build link after running `eas build --platform android --profile preview`]

| Account | Email | Password |
|---------|-------|----------|
| Regular User | testuser@example.com | TestUser123 |
| Admin | admin@test.com | AdminPassword123 |

> ⚠️ Backend is on Render free tier. First request takes 30–50s (cold start). Subsequent requests are fast.

---

## Manual Test Checklist

### Mobile App
- [ ] Register → OTP email received < 60s
- [ ] Wrong OTP → error shown
- [ ] Correct OTP → redirected to login
- [ ] Resend OTP → countdown works → new OTP arrives
- [ ] Resend 4× → rate limit error
- [ ] Login with unverified email → "Please verify your email"
- [ ] Login with wrong password → "Invalid credentials"
- [ ] Login success → dashboard loads
- [ ] Dashboard shows name, email, role, verified status
- [ ] Logout → back to login, SecureStore cleared
- [ ] Login again → works
- [ ] Forgot password → email received
- [ ] Deep link opens reset form in app
- [ ] Mismatched passwords → validation error
- [ ] Valid reset → login with new password works
- [ ] Old session invalidated after reset

### Admin Dashboard
- [ ] Non-admin login → "Admin access only"
- [ ] Admin login → stats page loads
- [ ] Stats show correct counts
- [ ] Users list with pagination
- [ ] Name/email search works (debounced)
- [ ] Role filter works
- [ ] Active/Inactive filter works
- [ ] Toggle inactive → confirm → user deactivated
- [ ] Deactivated user login → "Account deactivated"
- [ ] Toggle active → login works again
- [ ] Change role → role updated
- [ ] User detail shows active session count
- [ ] Admin logout → back to login

---

## Architecture Explanation (for submission email)

This full-stack mobile application is built with React Native (Expo SDK 51) for the mobile client, Node.js + Express for the REST API backend, MongoDB Atlas for the database, and a separate React + Vite admin dashboard.

**Authentication Flow:** JWT-based with short-lived access tokens (15 minutes, stored in React Context / memory only) and long-lived refresh tokens (7 days). On mobile, the refresh token is stored in `expo-secure-store` (AES-256 encrypted), never in AsyncStorage which is unencrypted. Token rotation is implemented — each refresh issues a new pair.

**OTP Flow:** On registration, a 6-digit OTP is generated using `crypto.randomInt`, saved with a 10-minute TTL index in MongoDB (auto-deleted by Atlas), and sent via Resend. Rate-limited to 3 resends per hour per email.

**Password Reset:** Uses a 32-byte random hex token, SHA-256 hashed before storage. Reset link includes both a deep link (`yourapp://`) for the mobile app and a web fallback. On reset, all existing refresh tokens for that user are revoked.

**Admin Panel:** Separate React + Vite web app communicating with the same backend. Protected by role-based middleware. Admin tokens stored in localStorage (acceptable for internal tools).

**Security Measures:** bcrypt (12 rounds) for passwords, `helmet` for HTTP headers, `express-mongo-sanitize` against NoSQL injection, `express-rate-limit` (10 req/15min on auth routes), `express-validator` for input validation, SHA-256 hashing for all tokens stored in DB.

**MongoDB TTL Indexes** automatically clean up expired OTPs, refresh tokens, and password reset tokens — no cron job needed.

---

## Submission Email (ready to send)

```
Subject: Internship Assignment Submission — Full-Stack Mobile App

Dear Sanjib,

I am pleased to submit my internship assignment: a full-stack mobile application with React Native (Expo), Node.js backend, MongoDB, and a React admin dashboard.

LIVE LINKS:
- Backend API: https://assign-tfx3.onrender.com
- Admin Dashboard: https://[VERCEL_URL].vercel.app
- APK Download: https://expo.dev/artifacts/[EAS_BUILD_ID]
- IPA: Note — IPA for real device requires Apple Developer account ($99/yr). APK is provided instead.

TEST CREDENTIALS:
Regular User: testuser@example.com / TestUser123
Admin User:   admin@test.com / AdminPassword123

NOTE: Backend on Render free tier — first request may take 30–50 seconds (cold start). All subsequent requests are fast.

IMPLEMENTED FEATURES:
✓ User registration with email + OTP verification (10 min expiry)
✓ JWT auth: 15-min access token (memory) + 7-day refresh token (SecureStore)
✓ Token rotation on refresh, full revocation on logout/password reset
✓ Resend OTP with rate limiting (3/hour per email)
✓ Forgot password with deep link + web fallback
✓ Secure password reset (SHA-256 hashed tokens)
✓ Admin dashboard: user management, role control, stats
✓ MongoDB TTL indexes for automatic token cleanup
✓ Security: bcrypt 12 rounds, helmet, CORS, mongoSanitize, rate limiting
✓ APK via EAS Build (Android)

ARCHITECTURE:
React Native (Expo SDK 51) + expo-router for navigation
Node.js + Express REST API deployed on Render
MongoDB Atlas with TTL indexes
Resend for transactional emails
React + Vite admin dashboard on Vercel

Please do not hesitate to reach out if you have any questions.

Best regards,
[Your Name]
```

---

## EAS Build Commands

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build APK (Android, downloadable)
cd mobile
eas build --platform android --profile preview

# Build IPA (iOS — requires Apple Developer account)
eas build --platform ios --profile preview

# Download: check https://expo.dev → your project → Builds
```

## Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Seed Admin (Render Shell)

```bash
ADMIN_EMAIL=admin@yourdomain.com ADMIN_PASSWORD=YourPass123 node src/scripts/seedAdmin.js
```
