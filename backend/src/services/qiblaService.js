/**
 * Qibla Direction Calculation Service
 * Calculates the bearing and distance from user location to Kaaba
 *
 * Kaaba coordinates: 21.4225°N, 39.8262°E
 */

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

/**
 * Convert degrees to radians
 */
function toRadian(degree) {
  return (degree * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
function toDegree(radian) {
  return (radian * 180) / Math.PI;
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadian(lat2 - lat1);
  const dLng = toRadian(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadian(lat1)) *
      Math.cos(toRadian(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate bearing (direction) from one point to another
 * Returns bearing in degrees (0-360), where 0 is North
 */
function calculateBearing(lat1, lng1, lat2, lng2) {
  const dLng = toRadian(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRadian(lat2));
  const x =
    Math.cos(toRadian(lat1)) * Math.sin(toRadian(lat2)) -
    Math.sin(toRadian(lat1)) *
      Math.cos(toRadian(lat2)) *
      Math.cos(dLng);

  let bearing = toDegree(Math.atan2(y, x));
  bearing = (bearing + 360) % 360; // Normalize to 0-360
  return bearing;
}

/**
 * Get Qibla direction from user location
 */
function getQibla(latitude, longitude) {
  if (
    !latitude ||
    !longitude ||
    isNaN(latitude) ||
    isNaN(longitude)
  ) {
    throw new Error('Invalid coordinates provided');
  }

  // Validate latitude (-90 to 90) and longitude (-180 to 180)
  if (latitude < -90 || latitude > 90) {
    throw new Error('Latitude must be between -90 and 90');
  }
  if (longitude < -180 || longitude > 180) {
    throw new Error('Longitude must be between -180 and 180');
  }

  const bearing = calculateBearing(latitude, longitude, KAABA_LAT, KAABA_LNG);
  const distance = calculateDistance(latitude, longitude, KAABA_LAT, KAABA_LNG);

  return {
    bearing_degrees: Math.round(bearing * 100) / 100,
    distance_km: Math.round(distance * 100) / 100,
    latitude,
    longitude,
    kaaba_location: {
      latitude: KAABA_LAT,
      longitude: KAABA_LNG
    },
    last_updated_timestamp: new Date().toISOString()
  };
}

module.exports = {
  getQibla,
  calculateBearing,
  calculateDistance,
  toRadian,
  toDegree
};
