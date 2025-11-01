# Islamic Companion API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
Currently, endpoints are public. JWT-based authentication will be implemented in Phase 2.

---

## Endpoints

### Prayer Times

#### Get Prayer Times
```
GET /prayer-times?lat={lat}&lng={lng}&method={method}&madhab={madhab}&date={date}
```

**Query Parameters:**
- `lat` (number, required): Latitude
- `lng` (number, required): Longitude
- `method` (string, optional): Calculation method
  - `MWL` (default) - Muslim World League
  - `ISNA` - North America
  - `EGYPTIAN` - Egypt
  - `UMM_AL_QURA` - Makkah
  - `KARACHI` - Pakistan
- `madhab` (string, optional): Islamic school
  - `shafi` (default)
  - `hanafi`
  - `maliki`
  - `hanbali`
- `date` (string, optional): Date in YYYY-MM-DD format (defaults to today)

**Response:**
```json
{
  "date": "2025-11-01",
  "method": "MWL",
  "madhab": "shafi",
  "timezone": "UTC",
  "prayers": {
    "fajr": "05:01",
    "sunrise": "06:45",
    "dhuhr": "12:05",
    "asr": "14:30",
    "maghrib": "17:20",
    "isha": "18:45"
  },
  "next_prayer": "dhuhr",
  "time_to_next_prayer_seconds": 1200,
  "location": {
    "latitude": 40.7128,
    "longitude": -74.006
  }
}
```

#### Get Calculation Methods
```
GET /prayer-times/methods
```

#### Get Madhabs
```
GET /prayer-times/madhabs
```

---

### Qibla

#### Get Qibla Direction
```
GET /qibla?lat={lat}&lng={lng}
```

**Query Parameters:**
- `lat` (number, required): Latitude
- `lng` (number, required): Longitude

**Response:**
```json
{
  "bearing_degrees": 118.9,
  "distance_km": 5240.3,
  "accuracy_meters": 15,
  "is_compass_reliable": true,
  "latitude": 40.7128,
  "longitude": -74.006,
  "kaaba_location": {
    "latitude": 21.4225,
    "longitude": 39.8262
  },
  "last_updated_timestamp": "2025-11-01T12:00:00Z",
  "fallback_method": "gps_bearing"
}
```

---

### Quran

#### Get Surahs List
```
GET /quran/surahs
```

#### Get Specific Surah
```
GET /quran/surah/{surah_number}?translation={lang}
```

**Parameters:**
- `surah_number` (number): Surah number (1-114)
- `translation` (string, optional): Language code (en, fr, id)

#### Search Quran
```
GET /quran/search?q={search_text}&lang={lang}
```

#### Get Recitations
```
GET /quran/recitations
```

---

### Hadith

#### Get Collections
```
GET /hadith/collections
```

#### Get Books in Collection
```
GET /hadith/collection/{collection_id}/books
```

#### Get Hadiths from Book
```
GET /hadith/collection/{collection_id}/book/{book_id}?page={page}
```

#### Search Hadiths
```
GET /hadith/search?q={search_text}&collection={collection_id}
```

#### Get Specific Hadith
```
GET /hadith/{hadith_id}
```

---

### Adhkar

#### Get Categories
```
GET /adhkar/categories
```

#### Get Adhkar by Category
```
GET /adhkar/category/{category_id}
```

#### Increment Counter
```
POST /adhkar/counter/{adhkar_id}
```

**Body:**
```json
{
  "user_id": "string",
  "date": "YYYY-MM-DD",
  "increment": 1
}
```

#### Get User Progress
```
GET /adhkar/progress?user_id={user_id}&date={date}
```

---

### Authentication

#### Register
```
POST /auth/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

#### Login
```
POST /auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

---

### User Settings

#### Get Settings
```
GET /user/settings?user_id={user_id}
```

#### Update Settings
```
POST /user/settings
```

**Body:**
```json
{
  "user_id": "string",
  "prayer_preferences": {},
  "notification_preferences": {},
  "language": "ar",
  "theme": "light"
}
```

#### Get Bookmarks
```
GET /user/bookmarks?user_id={user_id}
```

#### Add/Remove Bookmark
```
POST /user/bookmarks
```

**Body:**
```json
{
  "user_id": "string",
  "item_type": "quran_verse|hadith",
  "item_id": "string",
  "action": "add|remove",
  "note": "optional"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "status": 400
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity
- `503` - Service Unavailable
- `500` - Internal Server Error

---

## Rate Limiting (Planned)

API calls will be rate-limited in production:
- Anonymous users: 100 requests per hour
- Authenticated users: 1000 requests per hour

---

## CORS Headers

All requests must include appropriate CORS headers. CORS is enabled for all origins in development.

---

## Development

### Start Server
```bash
npm run dev
```

### Run Tests
```bash
npm test
```

---
