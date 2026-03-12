import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useFonts, Rubik_400Regular, Rubik_700Bold } from '@expo-google-fonts/rubik';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  {
    id: 'flowers',
    title: 'זר פרחים + ברכה',
    subtitle: 'שליחת זר פרחים עם מכתב נלווה\nתזמון עד 3 שנים קדימה',
    icon: 'flower-outline',
    gradientColors: ['#F7F5EF', '#EDE8DD'],
    iconColor: '#C5A059',
    borderColor: '#D4AF37',
  },
  {
    id: 'video',
    title: 'קטע וידאו + ברכה',
    subtitle: 'סרטון אישי + מכתב ותמונה מהעבר\nתזמון עד 10 שנים',
    icon: 'videocam-outline',
    gradientColors: ['#EEF3F2', '#DDE8E6'],
    iconColor: '#5F7F85',
    borderColor: '#7A9FA5',
  },
  {
    id: 'audio',
    title: 'קטע אודיו + ברכה',
    subtitle: 'הקלטה קולית + מכתב ותמונה מהעבר\nתזמון עד 10 שנים',
    icon: 'mic-outline',
    gradientColors: ['#F5F3EC', '#EAE5D8'],
    iconColor: '#7A8F74',
    borderColor: '#8FA589',
  },
  {
    id: 'letter',
    title: 'ברכה + תמונה מהעבר',
    subtitle: 'מכתב/ברכה עם רקעים מעוצבים\nתזמון עד 10 שנים',
    icon: 'mail-outline',
    gradientColors: ['#F9F7F0', '#F1EBD8'],
    iconColor: '#C5A059',
    borderColor: '#D4AF37',
  },
];

const PackageCategoriesScreen = ({ navigation, route }) => {
  const { user, token, phoneNumber } = route.params || {};
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnims = useRef(CATEGORIES.map(() => new Animated.Value(60))).current;
  const scaleAnims = useRef(CATEGORIES.map(() => new Animated.Value(0.9))).current;

  const [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_700Bold,
  });

  useEffect(() => {
    // Fade in header
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Stagger category cards
    const animations = CATEGORIES.map((_, index) =>
      Animated.parallel([
        Animated.timing(slideAnims[index], {
          toValue: 0,
          duration: 500,
          delay: index * 120,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnims[index], {
          toValue: 1,
          tension: 60,
          friction: 8,
          delay: index * 120,
          useNativeDriver: true,
        }),
      ])
    );
    Animated.stagger(100, animations).start();
  }, []);

  const handleCategoryPress = (category) => {
    navigation.navigate('PackageOptions', {
      ...route.params,
      categoryId: category.id,
      categoryTitle: category.title,
    });
  };

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0E8" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Text style={styles.greeting}>הי {user?.firstName || ''},</Text>
          <Text style={styles.headerTitle}>בחר את החבילה שלך</Text>
          <Text style={styles.headerSubtitle}>כל החבילות במחיר חד-פעמי ללא מנוי</Text>
        </Animated.View>

        {/* Video Placeholder */}
        <Animated.View style={[styles.videoContainer, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={['#3E4F46', '#5A6F60']}
            style={styles.videoGradient}
          >
            <Ionicons name="play-circle-outline" size={56} color="#D4AF37" />
            <Text style={styles.videoText}>סרטון הסבר קצר</Text>
            <Text style={styles.videoSubtext}>לחץ לצפייה</Text>
          </LinearGradient>
        </Animated.View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          {CATEGORIES.map((category, index) => (
            <Animated.View
              key={category.id}
              style={[
                styles.categoryCardWrapper,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnims[index] },
                    { scale: scaleAnims[index] },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={category.gradientColors}
                  style={styles.categoryGradient}
                >
                  <View style={styles.categoryContent}>
                    <View style={[styles.categoryIconCircle, { borderColor: category.borderColor }]}>
                      <Ionicons name={category.icon} size={36} color={category.iconColor} />
                    </View>
                    <View style={styles.categoryTextContainer}>
                      <Text style={styles.categoryTitle}>{category.title}</Text>
                      <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
                    </View>
                    <Ionicons name="chevron-back" size={24} color="#7A8A8A" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
      <BottomNavBar navigation={navigation} activeTab="packages" user={route?.params?.user} token={route?.params?.token} phoneNumber={route?.params?.phoneNumber} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DED9CC',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 20,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Rubik_400Regular',
    color: '#C5A059',
    textAlign: 'center',
  },
  videoContainer: {
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#2D5B5B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  videoGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  videoText: {
    fontSize: 18,
    fontFamily: 'Rubik_700Bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  videoSubtext: {
    fontSize: 14,
    fontFamily: 'Rubik_400Regular',
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
  },
  categoryCardWrapper: {
    marginBottom: 16,
  },
  categoryCard: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  categoryGradient: {
    borderRadius: 18,
    padding: 20,
  },
  categoryContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  categoryIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryTextContainer: {
    flex: 1,
    marginRight: 16,
    marginLeft: 8,
  },
  categoryTitle: {
    fontSize: 18,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    textAlign: 'right',
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 13,
    fontFamily: 'Rubik_400Regular',
    color: '#5A6A6A',
    textAlign: 'right',
    lineHeight: 19,
  },
});

export default PackageCategoriesScreen;
