import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function ScreenComponent() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Screen Component</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  text: {
    fontSize: 18,
    color: '#333'
  }
});
