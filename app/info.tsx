import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Camera, Sparkles, Zap } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function InfoPage() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'About Iris',
          headerStyle: { backgroundColor: '#f8f9fa' },
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color="#8B5CF6" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Image 
                source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/9gtmd2cf1epib0jul782r' }}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appName}>Iris</Text>
            <Text style={styles.version}>Version 1.0.0</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What is Iris?</Text>
            <Text style={styles.sectionText}>
              Iris is an AI-powered vision assistant that analyzes images and provides detailed descriptions of what it sees. Using advanced computer vision technology, Iris can identify objects, scenes, text, and much more.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How to Use Iris</Text>
            
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Camera size={20} color="#8B5CF6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Take a Photo</Text>
                <Text style={styles.featureDescription}>
                  Point your camera at any object, scene, or text and tap the shutter button to capture an image.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Sparkles size={20} color="#8B5CF6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>AI Analysis</Text>
                <Text style={styles.featureDescription}>
                  Iris will analyze your image using advanced AI and provide a detailed description of what it sees.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Zap size={20} color="#8B5CF6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Research Enhancement</Text>
                <Text style={styles.featureDescription}>
                  When needed, Iris conducts web research to provide more accurate and detailed information about specific objects or landmarks.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Camera Controls</Text>
            <Text style={styles.sectionText}>
              • <Text style={styles.bold}>Zoom:</Text> Use the + and - buttons on the right side, or pinch to zoom{"\n"}
              • <Text style={styles.bold}>Switch Camera:</Text> Tap the camera icon in the top right to switch between front and back cameras{"\n"}
              • <Text style={styles.bold}>Gallery:</Text> Tap the image icon next to the shutter button to select photos from your device
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tips for Best Results</Text>
            <Text style={styles.sectionText}>
              • Ensure good lighting for clearer images{"\n"}
              • Hold the device steady when taking photos{"\n"}
              • Get close to text or small details for better recognition{"\n"}
              • Try different angles for complex scenes
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Iris uses advanced AI technology to provide accurate image analysis. Results may vary based on image quality and content.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoImage: {
    width: 64,
    height: 64,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  version: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  bold: {
    fontWeight: '600',
    color: '#000',
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureContent: {
    flex: 1,
    paddingTop: 2,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
});