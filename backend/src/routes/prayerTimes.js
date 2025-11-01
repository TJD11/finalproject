const express = require('express');
const router = express.Router();
const prayerService = require('../services/prayerTimesService');
const logger = require('../utils/logger');

/**
 * GET /api/v1/prayer-times
 * Calculate prayer times for a given location
 *
 * Query Parameters:
 *   lat: number (latitude) - required
 *   lng: number (longitude) - required
 *   method: string (MWL, ISNA, Egyptian, UmmAlQura, Karachi) - optional, defaults to MWL
 *   madhab: string (hanafi, maliki, shafi, hanbali) - optional, defaults to shafi
 *   date: string (YYYY-MM-DD) - optional, defaults to today
 */
router.get('/', (req, res, next) => {
  try {
    const { lat, lng, method = 'MWL', madhab = 'shafi', date } = req.query;

    // Validate required parameters
    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Missing required parameters: lat and lng',
        status: 400
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        error: 'Latitude and longitude must be valid numbers',
        status: 400
      });
    }

    // Use provided date or current date
    const prayerDate = date || new Date().toISOString().split('T')[0];

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(prayerDate)) {
      return res.status(400).json({
        error: 'Date must be in YYYY-MM-DD format',
        status: 400
      });
    }

    const prayerTimes = prayerService.calculatePrayerTimes(
      latitude,
      longitude,
      prayerDate,
      method.toUpperCase(),
      madhab.toLowerCase(),
      'UTC'
    );

    // Add time to next prayer
    const now = new Date();
    const currentHours = now.getHours() + now.getMinutes() / 60;

    let timeToNextPrayer = 0;
    const nextPrayerTime = prayerTimes.prayers[prayerTimes.next_prayer];

    if (nextPrayerTime) {
      const [h, m] = nextPrayerTime.split(':').map(Number);
      const prayerHours = h + m / 60;

      if (prayerHours >= currentHours) {
        timeToNextPrayer = (prayerHours - currentHours) * 3600;
      } else {
        // Next prayer is tomorrow
        timeToNextPrayer = ((24 - currentHours) + prayerHours) * 3600;
      }
    }

    res.json({
      ...prayerTimes,
      time_to_next_prayer_seconds: Math.round(timeToNextPrayer),
      location: {
        latitude,
        longitude
      }
    });
  } catch (error) {
    logger.error(`Prayer times calculation error: ${error.message}`);
    res.status(error.message.includes('Cannot calculate') ? 503 : 400).json({
      error: error.message,
      status: error.message.includes('Cannot calculate') ? 503 : 400
    });
  }
});

/**
 * GET /api/v1/prayer-times/methods
 * Get list of supported calculation methods
 */
router.get('/methods', (req, res) => {
  res.json({
    methods: [
      { id: 'MWL', name: 'Muslim World League', regions: ['worldwide'] },
      { id: 'EGYPTIAN', name: 'Egyptian General Authority', regions: ['Egypt'] },
      { id: 'KARACHI', name: 'University of Islamic Sciences, Karachi', regions: ['Pakistan', 'South Asia'] },
      { id: 'UMM_AL_QURA', name: 'Umm Al-Qura, Makkah', regions: ['Saudi Arabia'] },
      { id: 'ISNA', name: 'ISNA (North America)', regions: ['North America'] }
    ]
  });
});

/**
 * GET /api/v1/prayer-times/madhabs
 * Get list of supported madhabs (Islamic schools)
 */
router.get('/madhabs', (req, res) => {
  res.json({
    madhabs: [
      { id: 'hanafi', name: 'Hanafi' },
      { id: 'maliki', name: 'Maliki' },
      { id: 'shafi', name: 'Shafi\'i' },
      { id: 'hanbali', name: 'Hanbali' }
    ]
  });
});

module.exports = router;
