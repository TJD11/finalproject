# Setup Instructions

## Prerequisites

- Node.js 16+ ([Download](https://nodejs.org/))
- npm or yarn
- Git
- For mobile development: Expo CLI (`npm install -g expo-cli`)
- For Android: Android Studio or Android SDK
- For iOS: Xcode

## Backend Setup

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create environment file
```bash
cp .env.example .env
```

### 4. Configure environment variables
Edit `.env` and update:
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://localhost/islamic_companion
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-change-in-production
```

### 5. Start development server
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## Frontend Setup

### 1. Navigate to frontend directory
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start Expo development server
```bash
npm start
```

### 4. Choose platform
- Press `a` for Android
- Press `i` for iOS
- Press `w` for web
- Press `q` to quit

## Database Setup (PostgreSQL)

### Option 1: Local PostgreSQL
```bash
# Create database
createdb islamic_companion

# Run migrations
cd backend
npm run migrate
```

### Option 2: Docker
```bash
docker-compose up -d postgres redis
```

## Testing

### Run backend tests
```bash
cd backend
npm test
```

### Run frontend tests
```bash
cd frontend
npm test
```

## Building

### Backend
```bash
cd backend
npm run build
```

### Frontend (React Native)
```bash
cd frontend

# Android APK
eas build --platform android

# iOS IPA
eas build --platform ios
```

## Troubleshooting

### Port already in use
```bash
# Change PORT in .env to different value
PORT=5001
```

### Database connection error
- Verify PostgreSQL is running
- Check DATABASE_URL is correct
- Ensure database exists

### Expo issues
```bash
# Clear cache
expo start -c

# Update Expo
npm install -g expo-cli@latest
```

### React Native issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm start -c
```

## Development Workflow

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes following code style
3. Test locally: `npm test`
4. Commit: `git commit -m "feat: add my feature"`
5. Push: `git push origin feature/my-feature`
6. Create Pull Request

## Code Style

- Use consistent indentation (2 spaces)
- Follow existing naming conventions
- Add comments for complex logic
- Use meaningful variable names

## Documentation

- Update relevant docs when making changes
- Add JSDoc comments to functions
- Update API.md when adding/changing endpoints

## Further Help

- See `/docs/API.md` for API reference
- Check `/docs/ARCHITECTURE.md` for system design
- Review project README.md for overview
