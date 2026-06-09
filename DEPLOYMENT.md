# AIRIX AI — Deployment Guide

## Prerequisites
- Docker 24+ and Docker Compose V2
- Node.js 20+
- Android Studio (for Android builds)
- Xcode 15+ (for iOS builds, macOS only)

## Backend Deployment

### 1. Environment Setup
```bash
cp .env.example .env
# Edit .env with your production values
```

### 2. Start with Docker (recommended)
```bash
# Development
docker compose -f docker-compose.dev.yml up -d

# Production
docker compose up -d --build
```

### 3. Database Migration & Seed
```bash
npm run migrate
npm run seed
```

### 4. Verify
```bash
curl http://localhost:3000/api/v1/health
```

## Mobile Build

### Android Release Build
```bash
cd apps/mobile
# Generate keystore (first time only)
keytool -genkeypair -v -storetype PKCS12 \
  -keystore android/app/upload-keystore.jks \
  -alias upload -keyalg RSA -keysize 2048 -validity 10000

# Add to android/gradle.properties:
# MYAPP_UPLOAD_STORE_FILE=upload-keystore.jks
# MYAPP_UPLOAD_KEY_ALIAS=upload
# MYAPP_UPLOAD_STORE_PASSWORD=<password>
# MYAPP_UPLOAD_KEY_PASSWORD=<password>

# Build
cd android && ./gradlew bundleRelease
# APK at: android/app/build/outputs/bundle/release/app-release.aab
```

### iOS Release Build
```bash
cd apps/mobile/ios
pod install
# Open AirixAI.xcworkspace in Xcode
# Product > Archive > Distribute App
```

## Environment Variables Reference

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | JWT signing secret (min 32 chars) |
| `OPENAI_API_KEY` | OpenAI API key |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `GOOGLE_AI_API_KEY` | Google Gemini API key |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `AWS_BUCKET_NAME` | S3 bucket for media uploads |

## Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (openssl rand -base64 32)
- [ ] Configure SSL/TLS (nginx reverse proxy recommended)
- [ ] Set up database backups
- [ ] Configure Firebase project and download `google-services.json`
- [ ] Set up Razorpay webhook endpoint
- [ ] Enable Redis persistence (AOF)
- [ ] Configure S3 CORS for image uploads
