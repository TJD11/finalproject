/**
 * Prayer Times Calculation Service
 * Supports multiple calculation methods:
 * - Muslim World League (MWL)
 * - Egyptian General Authority
 * - University of Islamic Sciences (Karachi)
 * - Umm Al-Qura
 * - ISNA (North America)
 */

// Calculation method configurations
const METHODS = {
  MWL: { fajr: 18, isha: 17, name: 'Muslim World League' },
  EGYPTIAN: { fajr: 19.5, isha: 17.5, name: 'Egyptian General Authority' },
  KARACHI: { fajr: 18, isha: 18, name: 'University of Islamic Sciences, Karachi' },
  UMM_AL_QURA: { fajr: 18.5, isha: 19.5, name: 'Umm Al-Qura, Makkah' },
  ISNA: { fajr: 15, isha: 15, name: 'ISNA (North America)' }
};

const MADHABS = {
  HANAFI: 'hanafi',
  MALIKI: 'maliki',
  SHAFI: 'shafi',
  HANBALI: 'hanbali'
};

// Asr shadow length factors by madhab
const ASR_FACTORS = {
  hanafi: 2,
  maliki: 1,
  shafi: 1,
  hanbali: 1
};

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
 * Get day of year
 */
function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Get the equation of time in minutes
 */
function getEquationOfTime(dayOfYear) {
  const B = (360 / 365) * (dayOfYear - 1);
  const B_rad = toRadian(B);
  return (
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(B_rad) -
      0.032077 * Math.sin(B_rad) -
      0.014615 * Math.cos(2 * B_rad) -
      0.040849 * Math.sin(2 * B_rad))
  );
}

/**
 * Get declination of the sun
 */
function getSunDeclination(dayOfYear) {
  const B = (360 / 365) * (dayOfYear - 1);
  const B_rad = toRadian(B);
  return (
    0.006918 -
    0.399912 * Math.cos(B_rad) +
    0.070257 * Math.sin(B_rad) -
    0.006758 * Math.cos(2 * B_rad) +
    0.000907 * Math.sin(2 * B_rad) -
    0.002697 * Math.cos(3 * B_rad) +
    0.00111 * Math.sin(3 * B_rad)
  );
}

/**
 * Calculate time for a given angle
 */
function getTimeForAngle(latitude, declination, angle, isAfterNoon = false) {
  const lat_rad = toRadian(latitude);
  const dec_rad = declination;
  const angle_rad = toRadian(angle);

  let cosH = -Math.tan(lat_rad) * Math.tan(dec_rad) - Math.sin(angle_rad) / (Math.cos(angle_rad) * Math.cos(lat_rad));

  if (Math.abs(cosH) > 1) {
    return null; // Sun does not reach this angle
  }

  let H = toDegree(Math.acos(cosH));
  if (isAfterNoon) {
    H = 360 - H;
  }
  return H / 15; // Convert to hours
}

/**
 * Calculate prayer times for a given date and location
 */
function calculatePrayerTimes(latitude, longitude, date, method = 'MWL', madhab = 'shafi', timezone = 'UTC') {
  // Validate inputs
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Invalid coordinates provided');
  }
  if (!METHODS[method]) {
    throw new Error(`Unknown method: ${method}`);
  }
  if (!MADHABS[madhab.toUpperCase()]) {
    throw new Error(`Unknown madhab: ${madhab}`);
  }

  const dateObj = new Date(date);
  const dayOfYear = getDayOfYear(dateObj);
  const eot = getEquationOfTime(dayOfYear);
  const declination = getSunDeclination(dayOfYear);

  // Calculate Dhuhr (noon)
  const solarNoon = 12 - longitude / 15 - eot / 60;

  // Get method configuration
  const methodConfig = METHODS[method];

  // Calculate Fajr
  const fajrHours = getTimeForAngle(latitude, declination, methodConfig.fajr, false);
  if (fajrHours === null) {
    throw new Error(`Cannot calculate prayer times for location ${latitude}, ${longitude}`);
  }
  const fajr = solarNoon - fajrHours;

  // Calculate Sunrise
  const sunriseHours = getTimeForAngle(latitude, declination, 0.833, false);
  const sunrise = solarNoon - sunriseHours;

  // Calculate Asr (based on madhab)
  const asrFactor = ASR_FACTORS[madhab] || 1;
  const asrAngle = toDegree(Math.atan(1 / (asrFactor + Math.tan(Math.abs(latitude * Math.PI / 180 - declination)))));
  const asrHours = getTimeForAngle(latitude, declination, asrAngle, true);
  const asr = solarNoon + asrHours;

  // Calculate Maghrib (sunset)
  const maghribHours = getTimeForAngle(latitude, declination, 0.833, true);
  const maghrib = solarNoon + maghribHours;

  // Calculate Isha
  const ishaHours = getTimeForAngle(latitude, declination, methodConfig.isha, true);
  const isha = solarNoon + ishaHours;

  // Format times as HH:MM
  const formatTime = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const dhuhr = formatTime(solarNoon);
  const fajrTime = formatTime(fajr);
  const sunriseTime = formatTime(sunrise);
  const asrTime = formatTime(asr);
  const maghribTime = formatTime(maghrib);
  const ishaTime = formatTime(isha);

  // Create ISO timestamps (simplified - using UTC)
  const createTimestamp = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    const ts = new Date(dateObj);
    ts.setHours(h, m, 0, 0);
    return ts.toISOString();
  };

  return {
    date: dateObj.toISOString().split('T')[0],
    method,
    madhab,
    timezone,
    prayers: {
      fajr: fajrTime,
      sunrise: sunriseTime,
      dhuhr,
      asr: asrTime,
      maghrib: maghribTime,
      isha: ishaTime
    },
    next_prayer: getNextPrayer(fajrTime, sunriseTime, dhuhr, asrTime, maghribTime, ishaTime),
    calculation_metadata: {
      latitude,
      longitude,
      equation_of_time_minutes: Math.round(eot * 100) / 100,
      sun_declination_degrees: Math.round(toDegree(declination) * 100) / 100
    }
  };
}

/**
 * Determine which prayer is next
 */
function getNextPrayer(fajr, sunrise, dhuhr, asr, maghrib, isha) {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const prayers = [
    { name: 'fajr', time: fajr },
    { name: 'sunrise', time: sunrise },
    { name: 'dhuhr', time: dhuhr },
    { name: 'asr', time: asr },
    { name: 'maghrib', time: maghrib },
    { name: 'isha', time: isha }
  ];

  for (const prayer of prayers) {
    if (prayer.time > currentTime) {
      return prayer.name;
    }
  }

  return 'fajr'; // Next day's Fajr
}

module.exports = {
  calculatePrayerTimes,
  METHODS,
  MADHABS,
  getNextPrayer
};
