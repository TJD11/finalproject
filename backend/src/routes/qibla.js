const express = require('express');
const router = express.Router();
const qiblaService = require('../services/qiblaService');
const logger = require('../utils/logger');

/**
 * GET /api/v1/qibla
 * Get Qibla direction from user location
 *
 * Query Parameters:
 *   lat: number (latitude)
 *   lng: number (longitude)
 */
router.get('/', (req, res, next) => {
  try {
    const { lat, lng } = req.query;

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

    const qibla = qiblaService.getQibla(latitude, longitude);

    res.json({
      ...qibla,
      accuracy_meters: 15,
      is_compass_reliable: true,
      fallback_method: 'gps_bearing'
    });
  } catch (error) {
    logger.error(`Qibla calculation error: ${error.message}`);
    res.status(400).json({
      error: error.message,
      status: 400
    });
  }
});

module.exports = router;
