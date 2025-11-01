import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
apiClient.interceptors.request.use(
  async (config) => {
    // TODO: Get token from AsyncStorage
    // const token = await AsyncStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // API returned error
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({ error: 'No response from server' });
    } else {
      return Promise.reject({ error: error.message });
    }
  }
);

export default apiClient;

/**
 * Prayer Times Services
 */
export const prayerTimesService = {
  getPrayerTimes: (lat, lng, options = {}) => {
    const params = {
      lat,
      lng,
      method: options.method || 'MWL',
      madhab: options.madhab || 'shafi',
      date: options.date
    };
    return apiClient.get('/prayer-times', { params });
  },

  getMethods: () => apiClient.get('/prayer-times/methods'),

  getMadhabs: () => apiClient.get('/prayer-times/madhabs')
};

/**
 * Qibla Services
 */
export const qiblaService = {
  getDirection: (lat, lng) => {
    const params = { lat, lng };
    return apiClient.get('/qibla', { params });
  }
};

/**
 * Quran Services
 */
export const quranService = {
  getSurahs: () => apiClient.get('/quran/surahs'),

  getSurah: (surahNumber, translation = 'en') => {
    return apiClient.get(`/quran/surah/${surahNumber}`, {
      params: { translation }
    });
  },

  search: (query, lang = 'ar') => {
    return apiClient.get('/quran/search', {
      params: { q: query, lang }
    });
  },

  getRecitations: () => apiClient.get('/quran/recitations')
};

/**
 * Hadith Services
 */
export const hadithService = {
  getCollections: () => apiClient.get('/hadith/collections'),

  getBooks: (collectionId) => {
    return apiClient.get(`/hadith/collection/${collectionId}/books`);
  },

  getHadiths: (collectionId, bookId, page = 1) => {
    return apiClient.get(
      `/hadith/collection/${collectionId}/book/${bookId}`,
      { params: { page } }
    );
  },

  search: (query, collection) => {
    const params = { q: query };
    if (collection) params.collection = collection;
    return apiClient.get('/hadith/search', { params });
  },

  getHadith: (hadithId) => apiClient.get(`/hadith/${hadithId}`)
};

/**
 * Adhkar Services
 */
export const adhkarService = {
  getCategories: () => apiClient.get('/adhkar/categories'),

  getCategory: (categoryId) => {
    return apiClient.get(`/adhkar/category/${categoryId}`);
  },

  incrementCounter: (adhkarId, userId, date) => {
    return apiClient.post(`/adhkar/counter/${adhkarId}`, {
      user_id: userId,
      date,
      increment: 1
    });
  },

  getProgress: (userId, date) => {
    return apiClient.get('/adhkar/progress', {
      params: { user_id: userId, date }
    });
  }
};

/**
 * Auth Services
 */
export const authService = {
  register: (email, password) => {
    return apiClient.post('/auth/register', { email, password });
  },

  login: (email, password) => {
    return apiClient.post('/auth/login', { email, password });
  },

  logout: () => apiClient.post('/auth/logout')
};

/**
 * User Services
 */
export const userService = {
  getSettings: (userId) => {
    return apiClient.get('/user/settings', {
      params: { user_id: userId }
    });
  },

  updateSettings: (userId, settings) => {
    return apiClient.post('/user/settings', {
      user_id: userId,
      ...settings
    });
  },

  getBookmarks: (userId) => {
    return apiClient.get('/user/bookmarks', {
      params: { user_id: userId }
    });
  },

  addBookmark: (userId, itemType, itemId, note) => {
    return apiClient.post('/user/bookmarks', {
      user_id: userId,
      item_type: itemType,
      item_id: itemId,
      action: 'add',
      note
    });
  },

  removeBookmark: (userId, itemType, itemId) => {
    return apiClient.post('/user/bookmarks', {
      user_id: userId,
      item_type: itemType,
      item_id: itemId,
      action: 'remove'
    });
  }
};
