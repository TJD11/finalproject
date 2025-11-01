import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import DashboardScreen from './src/screens/DashboardScreen';
import QiblaScreen from './src/screens/QiblaScreen';
import PrayerTimesScreen from './src/screens/PrayerTimesScreen';
import QuranScreen from './src/screens/QuranScreen';
import HadithScreen from './src/screens/HadithScreen';
import AdhkarScreen from './src/screens/AdhkarScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Store
import { useStore } from './src/store/appStore';

// i18n
import './src/i18n/i18n';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

/**
 * Dashboard Stack
 */
function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Home' }}
      />
    </Stack.Navigator>
  );
}

/**
 * Prayer Times Stack
 */
function PrayerTimesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Prayer Times'
      }}
    >
      <Stack.Screen
        name="PrayerTimes"
        component={PrayerTimesScreen}
      />
    </Stack.Navigator>
  );
}

/**
 * Qibla Stack
 */
function QiblaStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Qibla'
      }}
    >
      <Stack.Screen
        name="Qibla"
        component={QiblaScreen}
      />
    </Stack.Navigator>
  );
}

/**
 * Quran Stack
 */
function QuranStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Quran'
      }}
    >
      <Stack.Screen
        name="Quran"
        component={QuranScreen}
      />
    </Stack.Navigator>
  );
}

/**
 * Hadith Stack
 */
function HadithStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Hadith'
      }}
    >
      <Stack.Screen
        name="Hadith"
        component={HadithScreen}
      />
    </Stack.Navigator>
  );
}

/**
 * Adhkar Stack
 */
function AdhkarStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Adhkar'
      }}
    >
      <Stack.Screen
        name="Adhkar"
        component={AdhkarScreen}
      />
    </Stack.Navigator>
  );
}

/**
 * Settings Stack
 */
function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Settings'
      }}
    >
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
      />
    </Stack.Navigator>
  );
}

/**
 * Main App Component
 */
export default function App() {
  const [isReady, setIsReady] = useState(false);
  const initializeApp = useStore((state) => state.initializeApp);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeApp();
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsReady(true); // Continue anyway
      }
    };

    initialize();
  }, []);

  if (!isReady) {
    return null; // Show splash screen
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#2196F3',
            tabBarInactiveTintColor: '#999',
            tabBarStyle: {
              backgroundColor: '#fff',
              borderTopColor: '#eee'
            }
          }}
        >
          <Tab.Screen
            name="DashboardTab"
            component={DashboardStack}
            options={{
              title: 'Home',
              tabBarLabel: 'Home'
            }}
          />
          <Tab.Screen
            name="QiblaTab"
            component={QiblaStack}
            options={{
              title: 'Qibla',
              tabBarLabel: 'Qibla'
            }}
          />
          <Tab.Screen
            name="PrayerTimesTab"
            component={PrayerTimesStack}
            options={{
              title: 'Prayer Times',
              tabBarLabel: 'Prayers'
            }}
          />
          <Tab.Screen
            name="QuranTab"
            component={QuranStack}
            options={{
              title: 'Quran',
              tabBarLabel: 'Quran'
            }}
          />
          <Tab.Screen
            name="HadithTab"
            component={HadithStack}
            options={{
              title: 'Hadith',
              tabBarLabel: 'Hadith'
            }}
          />
          <Tab.Screen
            name="AdhkarTab"
            component={AdhkarStack}
            options={{
              title: 'Adhkar',
              tabBarLabel: 'Adhkar'
            }}
          />
          <Tab.Screen
            name="SettingsTab"
            component={SettingsStack}
            options={{
              title: 'Settings',
              tabBarLabel: 'Settings'
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
