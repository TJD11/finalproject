# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React Native)                  │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐   │
│  │Dashboard │ Qibla    │ Prayer   │ Quran    │ Adhkar   │   │
│  │Compass   │ Hadith   │ Settings │ Storage  │ Counter  │   │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘   │
│                      ↓ (HTTP/REST)                           │
├─────────────────────────────────────────────────────────────┤
│                    Backend API (Express)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Prayer Times | Qibla | Quran | Hadith | Adhkar |   │
│  │ Auth | User Settings | Bookmarks | Analytics      │   │
│  └──────────────────────────────────────────────────────┘   │
│                      ↓ (SQL/Cache)                           │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                                │
│  ┌──────────────────┬──────────────┬───────────────────┐    │
│  │ PostgreSQL       │ Redis Cache  │ S3/CDN            │    │
│  │ (User data,      │ (Prayer      │ (Audio files,     │    │
│  │  settings,       │  times,      │ Large datasets)   │    │
│  │  bookmarks)      │  search idx) │                   │    │
│  └──────────────────┴──────────────┴───────────────────┘    │
│                      ↑ (SQLite/JSON)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Embedded Storage (Mobile)                            │   │
│  │ - Quran text (Mushaf Uthmani)                        │   │
│  │ - Hadith collections (Bukhari, Muslim)              │   │
│  │ - Adhkar data                                        │   │
│  │ - User preferences                                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack Details

### Backend Services

#### Prayer Times Service
- **Algorithm**: NOAA solar calculation method
- **Methods Supported**:
  - Muslim World League (MWL)
  - ISNA (North America)
  - Egyptian General Authority
  - Umm Al-Qura (Makkah)
  - University of Islamic Sciences (Karachi)
- **Madhab Support**: Hanafi, Maliki, Shafi'i, Hanbali
- **Calculation Accuracy**: ±1 minute tolerance

#### Qibla Service
- **Algorithm**: Haversine formula for bearing calculation
- **Coordinates**: Kaaba (21.4225°N, 39.8262°E)
- **Output**: Bearing (0-360°), Distance (km), Accuracy indicator

#### Quran Service
- **Text Format**: JSON/SQLite (Mushaf Uthmani)
- **Structure**: Surah → Ayah (verse) → Translation/Tafsir
- **Search**: Full-text indexed search across Arabic + translations
- **Audio**: Streaming + downloadable recitations

#### Hadith Service
- **Collections**: Sahih Bukhari (7,563), Sahih Muslim (7,190)
- **Data**: Book → Hadith → Text, Narrator, Chain
- **Search**: Full-text indexed, filterable by collection/topic
- **Metadata**: Narrator chains, topic tags, source references

#### Adhkar Service
- **Categories**: 7 categories (morning, evening, sleep, wake, travel, prayer, ablution)
- **Features**: Counter, progress tracking, reminders
- **Data Storage**: Local counter + optional cloud sync

### Frontend Architecture

#### State Management (Zustand)
```javascript
- User preferences (prayer method, madhab, language)
- Location data (lat, lng, timestamp)
- Prayer times cache
- Qibla direction
- UI state (loading, errors)
```

#### Navigation Structure
```
Home (Dashboard)
├── Qibla (Full Compass)
├── Prayer Times (Daily + Monthly)
├── Quran
│   ├── Surah List
│   ├── Verse Details
│   └── Search Results
├── Hadith
│   ├── Collections
│   ├── Books
│   └── Hadith Details
├── Adhkar
│   ├── Categories
│   ├── Counter
│   └── Progress
└── Settings
    ├── Prayer Preferences
    ├── Notifications
    ├── Offline Downloads
    ├── Appearance
    └── Privacy/Account
```

## Data Models

### User Preferences
```json
{
  "user_id": "string (optional)",
  "prayer_preferences": {
    "calculation_method": "MWL|ISNA|Egyptian|UmmAlQura|Karachi",
    "madhab": "hanafi|maliki|shafi|hanbali",
    "location": {
      "latitude": "number",
      "longitude": "number",
      "city": "string",
      "country": "string"
    }
  },
  "notification_preferences": {
    "prayers_enabled": "boolean",
    "minutes_before": "5|10|15|30",
    "sound_enabled": "boolean",
    "vibration_enabled": "boolean",
    "prayer_mode_enabled": "boolean"
  },
  "language": "ar|en|fr|id",
  "theme": "light|dark",
  "font_size": "small|medium|large"
}
```

### Prayer Times
```json
{
  "date": "YYYY-MM-DD",
  "method": "string",
  "madhab": "string",
  "prayers": {
    "fajr": "HH:MM",
    "sunrise": "HH:MM",
    "dhuhr": "HH:MM",
    "asr": "HH:MM",
    "maghrib": "HH:MM",
    "isha": "HH:MM"
  },
  "next_prayer": "string",
  "time_to_next_prayer_seconds": "number"
}
```

### Quran
```json
{
  "surah_number": "number",
  "surah_name_ar": "string",
  "surah_name_en": "string",
  "verses": [
    {
      "ayah_number": "number",
      "arabic_text": "string (Uthmani)",
      "translations": {
        "en": "string",
        "fr": "string",
        "id": "string"
      },
      "tafsir": "string"
    }
  ]
}
```

### Hadith
```json
{
  "id": "collection_book_number",
  "collection": "bukhari|muslim",
  "book_number": "number",
  "hadith_number": "number",
  "arabic_text": "string",
  "english_text": "string",
  "narrator": "string",
  "chain_of_narrators": ["string"],
  "topic_tags": ["string"],
  "source": "string"
}
```

## API Endpoint Structure

### Prayer Times
- `GET /api/v1/prayer-times` - Calculate prayer times
- `GET /api/v1/prayer-times/methods` - List methods
- `GET /api/v1/prayer-times/madhabs` - List madhabs

### Qibla
- `GET /api/v1/qibla` - Get direction to Kaaba

### Quran
- `GET /api/v1/quran/surahs` - List all Surahs
- `GET /api/v1/quran/surah/:id` - Get specific Surah
- `GET /api/v1/quran/search` - Search Quran
- `GET /api/v1/quran/recitations` - List reciters

### Hadith
- `GET /api/v1/hadith/collections` - List collections
- `GET /api/v1/hadith/collection/:id/books` - List books
- `GET /api/v1/hadith/collection/:id/book/:bookId` - Get hadiths
- `GET /api/v1/hadith/search` - Search hadiths
- `GET /api/v1/hadith/:id` - Get hadith details

### Adhkar
- `GET /api/v1/adhkar/categories` - List categories
- `GET /api/v1/adhkar/category/:id` - Get category adhkar
- `POST /api/v1/adhkar/counter/:id` - Increment counter
- `GET /api/v1/adhkar/progress` - Get user progress

### User
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/user/settings` - Get settings
- `POST /api/v1/user/settings` - Update settings
- `POST /api/v1/user/bookmarks` - Manage bookmarks

## Offline-First Strategy

### Data Embedded in App
1. **Quran Text**: ~400 KB (compressed JSON/SQLite)
2. **Hadith Collections**: ~4 MB (indexed SQLite)
3. **Adhkar Data**: ~500 KB (JSON)
4. **Prayer Times**: Pre-calculated for 1 month

### Sync Strategy
- Local changes stored immediately
- Sync to server when online
- Conflict resolution: Last-write-wins
- Background sync supported

## Security Implementation

### Data Protection
- **HTTPS/TLS 1.2+**: All API communication encrypted
- **At-Rest Encryption**: AES-256 for sensitive data
- **JWT Tokens**: Stateless authentication
- **Refresh Tokens**: Automatic token renewal

### Privacy
- **Location**: Only used locally, not transmitted without consent
- **Analytics**: Anonymous, opt-in only, no PII
- **User Data**: Clear consent for all collection
- **No Third-Party Sharing**: Strict data isolation

## Performance Optimization

### Backend
- Redis caching for prayer times (24h TTL)
- Indexed full-text search (Quran, Hadith)
- Connection pooling (PostgreSQL)
- Gzip compression

### Frontend
- Local SQLite for instant access
- Lazy-loading screens
- Image caching
- Memory-efficient scrolling

### Targets
- Initial load: <2 seconds (4G)
- Prayer times: <200ms response
- Search results: <500ms response
- Qibla update: <50ms per refresh

## Deployment Architecture

### Development
- Local: `npm run dev`
- Testing: Jest + Integration tests

### Staging
- AWS/GCP/Azure staging environment
- Pre-production data
- Full feature testing

### Production
- Multi-region deployment
- Load balancing
- CDN for static assets + audio
- Database backups
- Monitoring + logging

## Scalability Considerations

### Current (MVP)
- Single backend instance
- Embedded data on mobile
- Simple caching strategy

### Future (Scale)
- Horizontal scaling (load balancer)
- Database read replicas
- Distributed caching
- CDN for global distribution
- Push notification service
- Analytics pipeline
