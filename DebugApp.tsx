import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DebugApp() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Debug App</Text>
      <Text style={styles.subtitle}>L'application se charge correctement !</Text>
      <Text style={styles.info}>
        Si vous voyez ce message, l'application fonctionne.
        Le problème vient probablement du composant principal.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  info: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 