import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

const ScreenLoading: React.FC = () => {
  return (
    <View style={styles.container}>
     
      <Text style={styles.title}>Asmay</Text>
      <Text style={styles.subtitle}>Votre réseau social en réalité augmentée</Text>
      <ActivityIndicator size="large" color="#007bff" style={styles.loader}  />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#faf9f8ff',
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 30,
  },
  loader: {
    marginTop: 20,
  },
});

export default ScreenLoading;