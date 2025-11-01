const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

/**
 * GET /api/v1/quran/surahs
 * Get list of all Surahs
 */
router.get('/surahs', (req, res) => {
  // TODO: Load from database
  res.json({
    surahs: [
      { number: 1, name_ar: 'الفاتحة', name_en: 'Al-Fatiha', ayah_count: 7, revelation_type: 'makkah' },
      { number: 2, name_ar: 'البقرة', name_en: 'Al-Baqarah', ayah_count: 286, revelation_type: 'madinah' }
    ],
    total: 114
  });
});

/**
 * GET /api/v1/quran/surah/:surah_number
 * Get specific Surah with verses
 */
router.get('/surah/:surah_number', (req, res) => {
  const { surah_number } = req.params;
  const { translation = 'en' } = req.query;

  // TODO: Load from database
  res.json({
    surah_number: parseInt(surah_number),
    surah_name_ar: 'الفاتحة',
    surah_name_en: 'Al-Fatiha',
    verses: [
      {
        ayah_number: 1,
        arabic_text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        translations: {
          en: 'In the name of Allah, the Most Gracious, the Most Merciful'
        }
      }
    ]
  });
});

/**
 * GET /api/v1/quran/search
 * Search Quran text
 */
router.get('/search', (req, res) => {
  const { q, lang = 'ar' } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Search query required' });
  }

  // TODO: Implement full-text search
  res.json({
    results: [],
    total: 0,
    query: q
  });
});

/**
 * GET /api/v1/quran/recitations
 * Get list of available reciters
 */
router.get('/recitations', (req, res) => {
  // TODO: Load from database
  res.json({
    reciters: [
      { id: 'mishary', name: 'Mishary Al-Afasy', lang: 'ar' },
      { id: 'ibrahim', name: 'Ibrahim Al-Akdar', lang: 'ar' }
    ]
  });
});

module.exports = router;
