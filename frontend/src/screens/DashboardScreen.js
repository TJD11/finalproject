import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { prayerTimesService } from '../services/apiClient';
import { useStore } from '../store/appStore';

/**
 * Dashboard Screen
 * Displays:
 * - Next prayer countdown
 * - Mini Qibla compass
 * - Quick action buttons
 */
export default function DashboardScreen() {
  const { t } = useTranslation();
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userPreferences = useStore((state) => state.userPreferences);
  const updatePrayerTimes = useStore((state) => state.updatePrayerTimes);

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        setLoading(true);
        if (userPreferences.latitude && userPreferences.longitude) {
          const times = await prayerTimesService.getPrayerTimes(
            userPreferences.latitude,
            userPreferences.longitude,
            {
              method: userPreferences.prayerMethod,
              madhab: userPreferences.madhab
            }
          );
          setPrayerTimes(times);
          updatePrayerTimes(times);
        }
      } catch (err) {
        setError(err.error || 'Failed to fetch prayer times');
        console.error('Error fetching prayer times:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();
  }, [userPreferences.latitude, userPreferences.longitude]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Next Prayer Card */}
      <View style={styles.card}>
        <Text style={styles.label}>{t('dashboard.nextPrayer')}</Text>
        {prayerTimes ? (
          <View>
            <Text style={styles.nextPrayerName}>
              {t(`prayers.${prayerTimes.next_prayer}`)}
            </Text>
            <Text style={styles.nextPrayerTime}>
              {prayerTimes.prayers[prayerTimes.next_prayer]}
            </Text>
            <Text style={styles.timeRemaining}>
              {Math.floor(prayerTimes.time_to_next_prayer_seconds / 60)} {t('common.loading')}
            </Text>
          </View>
        ) : (
          <Text style={styles.errorText}>{error || 'No data'}</Text>
        )}
      </View>

      {/* All Prayer Times List */}
      {prayerTimes && (
        <View style={styles.card}>
          <Text style={styles.label}>{t('navigation.prayers')}</Text>
          {Object.entries(prayerTimes.prayers).map(([key, time]) => (
            <View key={key} style={styles.prayerRow}>
              <Text style={styles.prayerName}>{t(`prayers.${key}`)}</Text>
              <Text style={styles.prayerTime}>{time}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.card}>
        <Text style={styles.label}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <View style={styles.actionButton}>
            <Text>{t('navigation.qibla')}</Text>
          </View>
          <View style={styles.actionButton}>
            <Text>{t('navigation.quran')}</Text>
          </View>
          <View style={styles.actionButton}>
            <Text>{t('navigation.adhkar')}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8
  },
  nextPrayerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4
  },
  nextPrayerTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8
  },
  timeRemaining: {
    fontSize: 16,
    color: '#999'
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  prayerName: {
    fontSize: 16,
    color: '#333'
  },
  prayerTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3'
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  actionButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center'
  },
  errorText: {
    color: 'red',
    fontSize: 16
  }
});
