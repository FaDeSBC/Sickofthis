import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { WebView } from 'react-native-webview';
import { Colors } from '../../../constants/Colors';

const { width, height } = Dimensions.get('window');

export default function MapViewPost({ route, navigation }: any) {
  const { latitude, longitude, locationName, title } = route.params;

  // Google Maps embed HTML
  const googleMapsHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
          }
          iframe {
            width: 100%;
            height: 100%;
            border: 0;
          }
        </style>
      </head>
      <body>
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d123423.91648139221!2d120.2104700291253!3d14.825404600422505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3396711b9c32216b%3A0xa080c3d36f2963a7!2sOlongapo%20City%2C%20Zambales!5e0!3m2!1sen!2sph!4v1765015827041!5m2!1sen!2sph" 
          allowfullscreen="" 
          loading="lazy" 
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Location Map</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoLocation}>📍 {locationName}</Text>
      </View>

      <View style={styles.mapContainer}>
        <WebView
          source={{ html: googleMapsHTML }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
        />
      </View>

      <View style={styles.coordinatesCard}>
        <Text style={styles.coordinatesLabel}>Coordinates:</Text>
        <Text style={styles.coordinatesText}>
          Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  backButton: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  infoCard: {
    backgroundColor: Colors.white,
    padding: 15,
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 5,
  },
  infoLocation: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  mapContainer: {
    flex: 1,
    margin: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  webview: {
    flex: 1,
  },
  coordinatesCard: {
    backgroundColor: Colors.white,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coordinatesLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 5,
  },
  coordinatesText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },
});