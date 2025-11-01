import create from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * App State Store using Zustand
 * Manages global app state including:
 * - User preferences (prayer method, madhab, language)
 * - Location data
 * - Prayer times
 * - UI state
 */

export const useStore = create((set, get) => ({
  // User preferences
  userPreferences: {
    language: 'ar',
    theme: 'light',
    prayerMethod: 'MWL',
    madhab: 'shafi',
    latitude: null,
    longitude: null,
    notificationsEnabled: true,
    minutesBeforePrayer: 10
  },

  // Prayer times
  prayerTimes: null,
  lastPrayerTimesUpdate: null,

  // Location
  userLocation: {
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null
  },

  // Qibla direction
  qiblaDirection: null,

  // UI state
  isLoading: false,
  error: null,

  // Initialize app
  initializeApp: async () => {
    try {
      // Load saved preferences from AsyncStorage
      const savedPreferences = await AsyncStorage.getItem('userPreferences');
      if (savedPreferences) {
        set({
          userPreferences: JSON.parse(savedPreferences)
        });
      }

      // Request location permission and get initial location
      // This will be handled by native code

      set({ isLoading: false });
    } catch (error) {
      console.error('Failed to initialize app:', error);
      set({ error: error.message });
    }
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    try {
      const currentPreferences = get().userPreferences;
      const updatedPreferences = {
        ...currentPreferences,
        ...preferences
      };

      await AsyncStorage.setItem(
        'userPreferences',
        JSON.stringify(updatedPreferences)
      );

      set({ userPreferences: updatedPreferences });
    } catch (error) {
      console.error('Failed to update preferences:', error);
      set({ error: error.message });
    }
  },

  // Update location
  updateLocation: (location) => {
    set({
      userLocation: {
        ...location,
        timestamp: new Date().toISOString()
      }
    });
  },

  // Update prayer times
  updatePrayerTimes: (prayerTimes) => {
    set({
      prayerTimes,
      lastPrayerTimesUpdate: new Date().toISOString()
    });
  },

  // Update Qibla direction
  updateQibla: (qibla) => {
    set({ qiblaDirection: qibla });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Set loading
  setLoading: (isLoading) => {
    set({ isLoading });
  }
}));
