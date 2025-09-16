import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert,
  PanResponder,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, X, Sparkles, Plus, Minus, Image, Info } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type AppState = 'camera' | 'processing' | 'result';

interface ProcessedImage {
  uri: string;
  description: string;
  sources?: Array<{
    title: string;
    url: string;
    favicon?: string;
  }>;
}

export default function IrisApp() {
  const [appState, setAppState] = useState<AppState>('camera');
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoom, setZoom] = useState<number>(0);
  
  const cameraRef = useRef<CameraView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;
  const liquidAnim1 = useRef(new Animated.Value(0)).current;
  const liquidAnim2 = useRef(new Animated.Value(0)).current;
  const liquidAnim3 = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const imageScaleAnim = useRef(new Animated.Value(1)).current;
  const zoomButtonsOpacity = useRef(new Animated.Value(1)).current;
  
  const lastPinchDistance = useRef<number>(0);
  const initialZoom = useRef<number>(0);

  useEffect(() => {
    console.log('App state changed to:', appState);
    if (appState === 'processing') {
      startShineAnimation();
    } else if (appState === 'result') {
      showResultCard();
    }
  }, [appState]);

  const startShineAnimation = () => {
    // Main liquid wave animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(shineAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Liquid layer animations with different speeds and directions
    Animated.loop(
      Animated.sequence([
        Animated.timing(liquidAnim1, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(liquidAnim1, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(liquidAnim2, {
          toValue: 1,
          duration: 3500,
          useNativeDriver: true,
        }),
        Animated.timing(liquidAnim2, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(liquidAnim3, {
          toValue: 1,
          duration: 2800,
          useNativeDriver: true,
        }),
        Animated.timing(liquidAnim3, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Subtle pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const showResultCard = () => {
    Animated.parallel([
      Animated.spring(cardAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(imageScaleAnim, {
        toValue: 0.7,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      console.log('Taking picture...');
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      console.log('Photo taken:', { hasUri: !!photo?.uri, hasBase64: !!photo?.base64 });

      if (photo?.uri && photo?.base64) {
        console.log('Setting captured image and starting processing');
        setCapturedImage(photo.uri);
        setAppState('processing');
        await processImage(photo.base64, photo.uri);
      } else {
        console.error('Photo missing required data:', photo);
        Alert.alert('Error', 'Failed to capture photo properly. Please try again.');
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    }
  };

  const processImage = async (base64Image: string, imageUri: string) => {
    console.log('Starting image processing with URI:', imageUri);
    setIsProcessing(true);
    
    try {
      console.log('Sending request to AI API...');
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an AI vision assistant called Iris. Analyze the image and provide a clear, concise, and informative description of what you see. Focus on the main subject, important details, colors, and context. If you identify specific objects, animals, plants, landmarks, artworks, or anything that would benefit from additional research or verification, please conduct web research to provide more accurate and detailed information. When you use research, format your response as JSON with this structure: {"description": "your description here", "sources": [{"title": "source title", "url": "source url"}]}. If no research is needed, just return the description as plain text. Keep descriptions under 150 words and make them engaging and informative.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'What do you see in this image?'
                },
                {
                  type: 'image',
                  image: base64Image
                }
              ]
            }
          ]
        })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI response received:', data);
      
      if (data.completion) {
        console.log('Setting processed image with description and URI:', imageUri);
        
        // Try to parse as JSON first (for research responses)
        let description = data.completion;
        let sources = undefined;
        
        try {
          const parsed = JSON.parse(data.completion);
          if (parsed.description) {
            description = parsed.description;
            sources = parsed.sources;
          }
        } catch (e) {
          // Not JSON, use as plain text
          console.log('Response is plain text, not JSON');
        }
        
        setProcessedImage({
          uri: imageUri,
          description,
          sources
        });
        setAppState('result');
      } else {
        console.error('No completion in response:', data);
        throw new Error('Invalid response from AI service');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert(
        'Analysis Failed', 
        'Unable to analyze the image. Please try again.',
        [
          { text: 'OK', onPress: () => resetToCamera() }
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const resetToCamera = () => {
    Animated.parallel([
      Animated.timing(cardAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(imageScaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCapturedImage(null);
      setProcessedImage(null);
      setAppState('camera');
      setZoom(0);
      shineAnim.setValue(0);
      liquidAnim1.setValue(0);
      liquidAnim2.setValue(0);
      liquidAnim3.setValue(0);
      pulseAnim.setValue(0);
    });
  };

  const getDistance = (touches: any[]) => {
    if (touches.length < 2) return 0;
    const [touch1, touch2] = touches;
    const dx = touch1.pageX - touch2.pageX;
    const dy = touch1.pageY - touch2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => evt.nativeEvent.touches.length === 2,
    onMoveShouldSetPanResponder: (evt) => evt.nativeEvent.touches.length === 2,
    onPanResponderGrant: (evt) => {
      if (evt.nativeEvent.touches.length === 2) {
        const distance = getDistance(evt.nativeEvent.touches);
        lastPinchDistance.current = distance;
        initialZoom.current = zoom;
        
        // Hide zoom buttons during pinch
        Animated.timing(zoomButtonsOpacity, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    },
    onPanResponderMove: (evt) => {
      if (evt.nativeEvent.touches.length === 2) {
        const currentDistance = getDistance(evt.nativeEvent.touches);
        const distanceRatio = currentDistance / lastPinchDistance.current;
        const zoomChange = (distanceRatio - 1) * 0.5;
        const newZoom = Math.max(0, Math.min(1, initialZoom.current + zoomChange));
        setZoom(newZoom);
      }
    },
    onPanResponderRelease: () => {
      // Show zoom buttons again
      Animated.timing(zoomButtonsOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    },
  });

  const adjustZoom = (delta: number) => {
    const newZoom = Math.max(0, Math.min(1, zoom + delta));
    setZoom(newZoom);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const selectImageFromLibrary = async () => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access photo library is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        console.log('Image selected from library:', { hasUri: !!asset.uri, hasBase64: !!asset.base64 });
        
        if (asset.uri && asset.base64) {
          console.log('Setting selected image and starting processing');
          setCapturedImage(asset.uri);
          setAppState('processing');
          await processImage(asset.base64, asset.uri);
        } else {
          console.error('Selected image missing required data:', asset);
          Alert.alert('Error', 'Failed to process selected image. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error selecting image from library:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Camera size={64} color="#8B5CF6" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            Iris needs camera access to analyze and describe objects for you
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {appState === 'camera' && (
        <View style={styles.camera} {...panResponder.panHandlers}>
          <CameraView 
            ref={cameraRef}
            style={styles.camera} 
            facing={facing}
            zoom={zoom}
          >
          <SafeAreaView style={styles.cameraContainer}>
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.infoButton}
                onPress={() => router.push('/info')}
              >
                <Info size={24} color="white" />
              </TouchableOpacity>
              <View style={styles.headerControls}>
                <TouchableOpacity 
                  style={styles.flipButton}
                  onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
                >
                  <Camera size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <Animated.View style={[styles.zoomControls, { opacity: zoomButtonsOpacity }]}>
              <TouchableOpacity 
                style={[styles.zoomButton, { opacity: zoom <= 0 ? 0.3 : 1 }]}
                onPress={() => adjustZoom(-0.1)}
                disabled={zoom <= 0}
              >
                <Minus size={20} color="white" />
              </TouchableOpacity>
              
              <View style={styles.zoomIndicator}>
                <View style={styles.zoomTrack}>
                  <View 
                    style={[
                      styles.zoomProgress, 
                      { width: `${zoom * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.zoomText}>{Math.round(zoom * 10 + 1)}x</Text>
              </View>
              
              <TouchableOpacity 
                style={[styles.zoomButton, { opacity: zoom >= 1 ? 0.3 : 1 }]}
                onPress={() => adjustZoom(0.1)}
                disabled={zoom >= 1}
              >
                <Plus size={20} color="white" />
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.captureContainer}>
              <TouchableOpacity onPress={takePicture} activeOpacity={0.8}>
                <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
                  <View style={styles.captureButtonOuter}>
                    <View style={styles.captureButtonInner} />
                  </View>
                </Animated.View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.galleryButton}
                onPress={selectImageFromLibrary} 
                activeOpacity={0.8}
              >
                <View style={styles.galleryButtonContainer}>
                  <Image size={24} color="white" />
                </View>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
          </CameraView>
        </View>
      )}

      {(appState === 'processing' || appState === 'result') && capturedImage && (
        <View style={styles.resultContainer}>
          <SafeAreaView style={styles.resultSafeArea}>
            {appState === 'processing' && (
              <>
                <Animated.Image 
                  source={{ uri: capturedImage }} 
                  style={[
                    styles.fullImage,
                    {
                      transform: [{ scale: imageScaleAnim }]
                    }
                  ]}
                />
                {/* Liquid overlay effects */}
                <View style={styles.liquidContainer}>
                  {/* Main liquid wave - Siri style */}
                  <Animated.View 
                    style={[
                      styles.liquidOverlay,
                      {
                        opacity: shineAnim.interpolate({
                          inputRange: [0, 0.2, 0.5, 0.8, 1],
                          outputRange: [0, 0.4, 0.6, 0.4, 0]
                        }),
                        transform: [{
                          translateX: shineAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-screenWidth * 2, screenWidth * 2]
                          })
                        }, {
                          skewX: '15deg'
                        }, {
                          scaleY: shineAnim.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [1, 1.1, 1]
                          })
                        }]
                      }
                    ]}
                  >
                    <LinearGradient
                      colors={[
                        'transparent',
                        'transparent',
                        'rgba(255, 45, 85, 0.3)',
                        'rgba(255, 159, 10, 0.4)',
                        'rgba(255, 214, 10, 0.5)',
                        'rgba(255, 159, 10, 0.4)',
                        'rgba(255, 45, 85, 0.3)',
                        'transparent',
                        'transparent'
                      ]}
                      start={{ x: 0, y: 0.2 }}
                      end={{ x: 1, y: 0.8 }}
                      style={styles.liquidGradient}
                    />
                  </Animated.View>

                  {/* Secondary liquid layer - Purple/Blue wave */}
                  <Animated.View 
                    style={[
                      styles.liquidOverlay2,
                      {
                        opacity: liquidAnim1.interpolate({
                          inputRange: [0, 0.3, 0.7, 1],
                          outputRange: [0, 0.35, 0.35, 0]
                        }),
                        transform: [{
                          translateX: liquidAnim1.interpolate({
                            inputRange: [0, 1],
                            outputRange: [screenWidth * 1.8, -screenWidth * 1.8]
                          })
                        }, {
                          skewX: '-12deg'
                        }, {
                          scaleX: liquidAnim1.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [1, 1.15, 1]
                          })
                        }]
                      }
                    ]}
                  >
                    <LinearGradient
                      colors={[
                        'transparent',
                        'transparent',
                        'rgba(88, 86, 214, 0.3)',
                        'rgba(255, 45, 85, 0.4)',
                        'rgba(175, 82, 222, 0.5)',
                        'rgba(255, 45, 85, 0.4)',
                        'rgba(88, 86, 214, 0.3)',
                        'transparent',
                        'transparent'
                      ]}
                      start={{ x: 0, y: 0.15 }}
                      end={{ x: 1, y: 0.85 }}
                      style={styles.liquidGradient}
                    />
                  </Animated.View>

                  {/* Tertiary liquid layer - Green/Cyan wave */}
                  <Animated.View 
                    style={[
                      styles.liquidOverlay3,
                      {
                        opacity: liquidAnim2.interpolate({
                          inputRange: [0, 0.4, 0.6, 1],
                          outputRange: [0, 0.3, 0.3, 0]
                        }),
                        transform: [{
                          translateX: liquidAnim2.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-screenWidth * 1.6, screenWidth * 2.2]
                          })
                        }, {
                          skewX: '18deg'
                        }, {
                          rotate: liquidAnim2.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '3deg']
                          })
                        }]
                      }
                    ]}
                  >
                    <LinearGradient
                      colors={[
                        'transparent',
                        'transparent',
                        'rgba(52, 199, 89, 0.3)',
                        'rgba(48, 209, 88, 0.4)',
                        'rgba(100, 210, 255, 0.5)',
                        'rgba(48, 209, 88, 0.4)',
                        'rgba(52, 199, 89, 0.3)',
                        'transparent',
                        'transparent'
                      ]}
                      start={{ x: 0, y: 0.1 }}
                      end={{ x: 1, y: 0.9 }}
                      style={styles.liquidGradient}
                    />
                  </Animated.View>

                  {/* Flowing liquid layer - Blue/Teal wave */}
                  <Animated.View 
                    style={[
                      styles.liquidOverlay4,
                      {
                        opacity: liquidAnim3.interpolate({
                          inputRange: [0, 0.25, 0.75, 1],
                          outputRange: [0, 0.4, 0.4, 0]
                        }),
                        transform: [{
                          translateX: liquidAnim3.interpolate({
                            inputRange: [0, 1],
                            outputRange: [screenWidth * 1.2, -screenWidth * 2.0]
                          })
                        }, {
                          skewX: '-20deg'
                        }, {
                          scaleY: liquidAnim3.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [1.05, 0.95, 1.05]
                          })
                        }]
                      }
                    ]}
                  >
                    <LinearGradient
                      colors={[
                        'transparent',
                        'transparent',
                        'rgba(0, 122, 255, 0.3)',
                        'rgba(90, 200, 250, 0.4)',
                        'rgba(64, 200, 224, 0.5)',
                        'rgba(90, 200, 250, 0.4)',
                        'rgba(0, 122, 255, 0.3)',
                        'transparent',
                        'transparent'
                      ]}
                      start={{ x: 0, y: 0.25 }}
                      end={{ x: 1, y: 0.75 }}
                      style={styles.liquidGradient}
                    />
                  </Animated.View>

                  {/* Subtle pulse overlay - Siri glow */}
                  <Animated.View 
                    style={[
                      styles.pulseOverlay,
                      {
                        opacity: pulseAnim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0, 0.15, 0]
                        }),
                        transform: [{
                          scale: pulseAnim.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [1, 1.02, 1]
                          })
                        }]
                      }
                    ]}
                  >
                    <LinearGradient
                      colors={[
                        'rgba(255, 255, 255, 0.2)',
                        'rgba(255, 45, 85, 0.1)',
                        'rgba(88, 86, 214, 0.1)',
                        'rgba(52, 199, 89, 0.1)',
                        'rgba(255, 159, 10, 0.1)',
                        'rgba(255, 255, 255, 0.2)'
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={styles.liquidGradient}
                    />
                  </Animated.View>
                </View>
                <View style={styles.processingOverlay}>
                  <View style={styles.analysingCard}>
                    <BlurView intensity={80} style={styles.blurContainer}>
                      <ActivityIndicator size="large" color="white" />
                      <Text style={styles.processingText}>Analyzing image...</Text>
                      <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={resetToCamera}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </BlurView>
                  </View>
                </View>
              </>
            )}

            {appState === 'result' && processedImage && (
              <Animated.View 
                style={[
                  styles.resultCard,
                  {
                    opacity: cardAnim,
                    transform: [
                      {
                        translateY: cardAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0]
                        })
                      }
                    ]
                  }
                ]}
              >
                <ScrollView 
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.imageContainer}>
                      <Animated.Image 
                        source={{ uri: processedImage.uri }} 
                        style={styles.resultImage}
                      />
                      <View style={styles.sparkleIcon}>
                        <Sparkles size={20} color="#8B5CF6" />
                      </View>
                    </View>
                    
                    <Text style={styles.descriptionTitle}>What I See</Text>
                    <Text style={styles.description}>{processedImage.description}</Text>
                    
                    {processedImage.sources && processedImage.sources.length > 0 && (
                      <View style={styles.sourcesContainer}>
                        <Text style={styles.sourcesTitle}>Research Sources</Text>
                        <View style={styles.sourcesList}>
                          {processedImage.sources.map((source, index) => (
                            <View key={index} style={styles.sourceItem}>
                              <View style={styles.sourceFavicon}>
                                {source.favicon ? (
                                  <Animated.Image 
                                    source={{ uri: source.favicon }} 
                                    style={styles.faviconImage}
                                  />
                                ) : (
                                  <View style={styles.defaultFavicon} />
                                )}
                              </View>
                              <Text style={styles.sourceText} numberOfLines={1}>
                                {source.title}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                    
                    <TouchableOpacity 
                      style={styles.newPhotoButton} 
                      onPress={resetToCamera}
                    >
                      <Camera size={20} color="white" />
                      <Text style={styles.newPhotoButtonText}>Take Another Photo</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>

                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={resetToCamera}
                >
                  <X size={24} color="#666" />
                </TouchableOpacity>
              </Animated.View>
            )}
          </SafeAreaView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomControls: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -75 }],
    alignItems: 'center',
    gap: 15,
  },
  zoomButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomIndicator: {
    alignItems: 'center',
    gap: 8,
  },
  zoomTrack: {
    width: 4,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  zoomProgress: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  zoomText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  captureContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 60,
  },
  galleryButton: {
    position: 'absolute',
    left: (screenWidth / 2) - 105,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    padding: 3,
  },
  captureButtonInner: {
    flex: 1,
    borderRadius: 37,
    backgroundColor: 'white',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
    color: '#000',
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  resultSafeArea: {
    flex: 1,
  },
  fullImage: {
    width: screenWidth,
    height: screenHeight,
    position: 'absolute',
  },
  liquidContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  liquidOverlay: {
    position: 'absolute',
    width: screenWidth * 3,
    height: screenHeight * 1.2,
    left: -screenWidth,
    top: -screenHeight * 0.1,
  },
  liquidOverlay2: {
    position: 'absolute',
    width: screenWidth * 3,
    height: screenHeight * 1.2,
    left: -screenWidth,
    top: -screenHeight * 0.1,
  },
  liquidOverlay3: {
    position: 'absolute',
    width: screenWidth * 3,
    height: screenHeight * 1.2,
    left: -screenWidth,
    top: -screenHeight * 0.1,
  },
  liquidOverlay4: {
    position: 'absolute',
    width: screenWidth * 3,
    height: screenHeight * 1.2,
    left: -screenWidth,
    top: -screenHeight * 0.1,
  },
  pulseOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  liquidGradient: {
    flex: 1,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analysingCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  blurContainer: {
    padding: 30,
    alignItems: 'center',
  },
  processingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 15,
    fontWeight: '600',
  },
  resultCard: {
    flex: 1,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  scrollContent: {
    flexGrow: 1,
  },
  cardContent: {
    padding: 20,
    alignItems: 'center',
  },
  imageContainer: {
    width: screenWidth * 0.6,
    aspectRatio: 4/6,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  sparkleIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  newPhotoButton: {
    flexDirection: 'row',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    gap: 8,
  },
  newPhotoButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  sourcesContainer: {
    width: '100%',
    marginTop: 20,
    marginBottom: 10,
  },
  sourcesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  sourcesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    maxWidth: screenWidth * 0.4,
  },
  sourceFavicon: {
    width: 16,
    height: 16,
    marginRight: 6,
    borderRadius: 2,
    overflow: 'hidden',
  },
  faviconImage: {
    width: '100%',
    height: '100%',
  },
  defaultFavicon: {
    width: '100%',
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  sourceText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
});