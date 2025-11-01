# Islamic Companion Mobile Application

A comprehensive Islamic mobile application providing prayer times, Qibla direction, Quran with recitations, Hadith collections, and daily Islamic reminders (Adhkar).

## Features

### Core Features (Phase 1)
- ✅ **Qibla Compass**: Interactive compass showing prayer direction with GPS + magnetometer
- ✅ **Prayer Times**: Multi-method calculation (MWL, ISNA, Egyptian, Umm Al-Qura, Karachi)
- ✅ **Quran**: Full scripture text with search capability
- ✅ **Hadith**: Sahih Bukhari & Muslim collections
- ✅ **Adhkar**: Daily Islamic remembrances with counter
- ✅ **Notifications**: Configurable prayer time alerts

### Phase 2 (In Development)
- Audio Recitations: Multiple reciters with streaming
- Full Quran Downloads: Offline reading with translations
- Advanced Tafsir Integration
- Complete offline support

### Phase 3 (Planned)
- Limited AI Assistant (source-verified only)
- Social Features (moderated)
- Mosque Finder
- Learning Modules

## Technology Stack

### Backend
- **Framework**: Node.js + Express
- **Database**: PostgreSQL + Redis
- **Auth**: JWT
- **Hosting**: AWS/GCP/Azure with CDN

### Frontend
- **Framework**: React Native
- **Platforms**: Android 8.0+, iOS 13.0+
- **State Management**: Zustand
- **i18n**: react-i18next (Arabic, English, French, Indonesian)
- **Local Storage**: SQLite + AsyncStorage

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Project Structure

```
.
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API endpoints
│   │   └── utils/          # Utilities
│   ├── package.json
│   └── .env.example
├── frontend/                # React Native app
│   ├── src/
│   │   ├── screens/        # Screen components
│   │   ├── services/       # API clients
│   │   ├── store/          # State management
│   │   └── i18n/           # Internationalization
│   └── package.json
├── docs/                    # Documentation
├── data/                    # Data files
└── README.md
```

## Documentation

- **API Reference**: See `/docs/API.md`
- **Setup Instructions**: See `/docs/SETUP.md` (coming soon)
- **Architecture**: See `/docs/ARCHITECTURE.md` (coming soon)

## Development Status

**Version**: 1.0.0 (Phase 1 - MVP)
**Status**: Active Development

### Completed
- Backend API structure (Express)
- Prayer times calculation service (5 methods)
- Qibla compass calculation
- Frontend app structure (React Native)
- Multi-language support (i18n)
- API client services

### In Progress
- Database schema and migrations
- Frontend screen implementations
- Offline data storage (SQLite)
- User authentication

### Planned
- Audio recitations
- Advanced Hadith search
- Adhkar progress tracking
- Notifications system

## Contributing

Follow existing code patterns and maintain privacy-first principles.

## License

MIT License