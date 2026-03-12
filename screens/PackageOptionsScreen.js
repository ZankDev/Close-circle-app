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
  Image,
  Alert,
  Modal,
} from 'react-native';
import { useFonts, Rubik_400Regular, Rubik_700Bold } from '@expo-google-fonts/rubik';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

// ============ DATA ============

const FLOWER_BOUQUETS = [
  {
    id: 'chrysanthemum',
    name: 'זר חרציות',
    description: 'חרציות במגוון צבעים וגרברות',
    price: 450,
    includes: 'חרציות צבעוניות + גרברות + ברכה מעוצבת',
    image: null,
    color: '#FF9800',
  },
  {
    id: 'wishes_large',
    name: 'זר איחולים גדול',
    description: 'שושן צחור לבן + ורדים לבנים + ליזי לבן',
    price: 500,
    includes: 'שושן צחור + ורדים לבנים + ליזי לבן + ברכה מעוצבת',
    image: null,
    color: '#FFFFFF',
  },
  {
    id: 'red_roses',
    name: 'זר ורדים אדומים',
    description: '15 ורדים אדומים',
    price: 500,
    includes: '15 ורדים אדומים מרהיבים + ברכה מעוצבת',
    image: null,
    color: '#F44336',
  },
  {
    id: 'large_pink_white',
    name: 'זר גדול לבן וורוד',
    description: 'ליליות ורודות, ליזי ורוד ולבן, ורדים',
    price: 650,
    includes: 'ליליות ורודות + ליזי ורוד ולבן + ורדים לבנים וורודים + ברכה מעוצבת',
    image: null,
    color: '#E91E63',
  },
];

const VIDEO_PACKAGES = [
  {
    id: 'video_1',
    name: 'סרטון בודד',
    description: "סרטון עד 2 דק' + מכתב + תמונה מהעבר",
    extraInfo: 'עד 10 נמענים',
    price: 160,
  },
  {
    id: 'video_2',
    name: '2 סרטונים',
    description: "2 סרטונים עד 2 דק' כ\"א + מכתב ותמונה לכל סרטון",
    extraInfo: 'עד 10 נמענים',
    price: 280,
  },
  {
    id: 'video_3',
    name: '3 סרטונים',
    description: "3 סרטונים עד 2 דק' כ\"א + מכתב ותמונה לכל סרטון",
    extraInfo: 'עד 10 נמענים',
    price: 350,
  },
];

const AUDIO_PACKAGES = [
  {
    id: 'audio_1',
    name: "הקלטה עד 10 דק'",
    description: "הקלטת אודיו עד 10 דק' + מכתב ותמונה מהעבר",
    extraInfo: 'אופציונלי: מכתב ותמונה',
    price: 120,
  },
  {
    id: 'audio_2',
    name: "הקלטה עד 20 דק'",
    description: "הקלטת אודיו עד 20 דק' + מכתב ותמונה מהעבר",
    extraInfo: 'אופציונלי: מכתב ותמונה',
    price: 180,
  },
  {
    id: 'audio_3',
    name: "3 הקלטות עד 20 דק'",
    description: "3 הקלטות אודיו עד 20 דק' כ\"א + מכתב ותמונה מהעבר",
    extraInfo: 'אופציונלי: מכתב ותמונה',
    price: 250,
  },
];

const LETTER_PACKAGES = [
  {
    id: 'letter_1',
    name: 'ברכה בודדת',
    description: 'ברכה ללא הגבלת טקסט + תמונה מהעבר',
    extraInfo: 'עד 10 נמענים',
    price: 50,
  },
  {
    id: 'letter_3',
    name: '3 ברכות',
    description: '3 ברכות ללא הגבלת טקסט + תמונה מהעבר',
    extraInfo: 'עד 10 נמענים',
    price: 120,
  },
  {
    id: 'letter_10',
    name: '10 ברכות',
    description: '10 ברכות ללא הגבלת טקסט + תמונה מהעבר',
    extraInfo: 'עד 10 נמענים',
    price: 250,
  },
];

const CATEGORY_CONFIG = {
  flowers: {
    headerTitle: 'זר פרחים + ברכה',
    icon: 'flower-outline',
    iconColor: '#4CAF50',
    packages: FLOWER_BOUQUETS,
    isFlowers: true,
    creationLabel: 'בחר זר פרחים לשליחה מתוזמנת',
  },
  video: {
    headerTitle: 'קטע וידאו + ברכה',
    icon: 'videocam-outline',
    iconColor: '#2196F3',
    packages: VIDEO_PACKAGES,
    isFlowers: false,
    creationLabel: 'צור את הסרטון שלך',
  },
  audio: {
    headerTitle: 'קטע אודיו + ברכה',
    icon: 'mic-outline',
    iconColor: '#FF9800',
    packages: AUDIO_PACKAGES,
    isFlowers: false,
    creationLabel: 'צור את ההקלטה שלך',
  },
  letter: {
    headerTitle: 'ברכה + תמונה מהעבר',
    icon: 'mail-outline',
    iconColor: '#9C27B0',
    packages: LETTER_PACKAGES,
    isFlowers: false,
    creationLabel: 'צור את הברכה שלך',
  },
};

// Flower bouquet placeholder images using colored gradients
const FLOWER_GRADIENT_COLORS = {
  chrysanthemum: ['#FF9800', '#FFB74D', '#FFF176'],
  wishes_large: ['#E8F5E9', '#FFFFFF', '#C8E6C9'],
  red_roses: ['#C62828', '#EF5350', '#FFCDD2'],
  large_pink_white: ['#F8BBD0', '#FCE4EC', '#F48FB1'],
};

const PackageOptionsScreen = ({ navigation, route }) => {
  const { categoryId, categoryTitle, user, token, phoneNumber } = route.params || {};
  const config = CATEGORY_CONFIG[categoryId] || CATEGORY_CONFIG.flowers;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnims = useRef(config.packages.map(() => new Animated.Value(50))).current;
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_700Bold,
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    config.packages.forEach((_, index) => {
      Animated.timing(slideAnims[index], {
        toValue: 0,
        duration: 450,
        delay: 150 + index * 100,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    // Show confirmation
    Alert.alert(
      'אישור רכישה',
      `האם ברצונך לרכוש את החבילה "${pkg.name}" במחיר ${pkg.price} \u20AA?`,
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'אישור',
          onPress: () => {
            setShowSuccessModal(true);
          },
        },
      ]
    );
  };

  const handleCreateContent = () => {
    setShowSuccessModal(false);
    navigation.navigate('Home', {
      phoneNumber,
      user,
      token,
      selectedPackage: selectedPackage,
      categoryId,
    });
  };

  if (!fontsLoaded) return null;

  const renderFlowerCard = (bouquet, index) => {
    const gradientColors = FLOWER_GRADIENT_COLORS[bouquet.id] || ['#ccc', '#eee', '#fff'];
    return (
      <Animated.View
        key={bouquet.id}
        style={[
          styles.flowerCardWrapper,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnims[index] }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.flowerCard}
          onPress={() => handlePackageSelect(bouquet)}
          activeOpacity={0.85}
        >
          {/* Flower image placeholder */}
          <LinearGradient
            colors={gradientColors}
            style={styles.flowerImageContainer}
          >
            <Ionicons name="flower" size={48} color={bouquet.color === '#FFFFFF' ? '#4CAF50' : bouquet.color} />
          </LinearGradient>

          <View style={styles.flowerInfoContainer}>
            <Text style={styles.flowerName}>{bouquet.name}</Text>
            <Text style={styles.flowerDescription}>{bouquet.description}</Text>
            <View style={styles.flowerIncludesContainer}>
              <Ionicons name="gift-outline" size={14} color="#2D8B8B" />
              <Text style={styles.flowerIncludes}>כולל ברכה מעוצבת</Text>
            </View>
            <View style={styles.flowerPriceRow}>
              <Text style={styles.flowerPrice}>{bouquet.price} \u20AA</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderPackageCard = (pkg, index) => (
    <Animated.View
      key={pkg.id}
      style={[
        styles.packageCardWrapper,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnims[index] }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.packageCard}
        onPress={() => handlePackageSelect(pkg)}
        activeOpacity={0.85}
      >
        <View style={styles.packageHeader}>
          <View style={[styles.packageIconCircle, { borderColor: config.iconColor }]}>
            <Ionicons name={config.icon} size={28} color={config.iconColor} />
          </View>
          <View style={styles.packageTitleContainer}>
            <Text style={styles.packageName}>{pkg.name}</Text>
            {pkg.extraInfo && (
              <Text style={styles.packageExtra}>{pkg.extraInfo}</Text>
            )}
          </View>
        </View>

        <Text style={styles.packageDescription}>{pkg.description}</Text>

        <View style={styles.packageFooter}>
          <View style={styles.priceTag}>
            <Text style={styles.packagePrice}>{pkg.price} \u20AA</Text>
            <Text style={styles.priceLabel}>חד פעמי</Text>
          </View>
          <View style={styles.selectButton}>
            <Text style={styles.selectButtonText}>בחר חבילה</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0E8" />

      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-forward" size={24} color="#2D5B5B" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name={config.icon} size={24} color={config.iconColor} style={{ marginLeft: 8 }} />
          <Text style={styles.headerBarTitle}>{config.headerTitle}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <Animated.View style={[styles.titleSection, { opacity: fadeAnim }]}>
          <Text style={styles.mainTitle}>בוא נתחיל</Text>
          <Text style={styles.mainSubtitle}>יש לבחור חבילה</Text>
        </Animated.View>

        {/* Packages */}
        {config.isFlowers ? (
          <View style={styles.flowersGrid}>
            {config.packages.map((bouquet, idx) => renderFlowerCard(bouquet, idx))}
          </View>
        ) : (
          <View style={styles.packagesContainer}>
            {config.packages.map((pkg, idx) => renderPackageCard(pkg, idx))}
          </View>
        )}
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={50} color="#2D8B8B" />
            </View>
            <Text style={styles.successTitle}>החבילה נרכשה בהצלחה</Text>
            <Text style={styles.successPackageName}>
              {selectedPackage?.name} - {selectedPackage?.price} \u20AA
            </Text>

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateContent}
            >
              <Text style={styles.createButtonText}>{config.creationLabel}</Text>
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#F5F0E8',
    borderBottomWidth: 1,
    borderBottomColor: '#E5DED3',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5DED3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  headerBarTitle: {
    fontSize: 18,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  titleSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    marginBottom: 4,
  },
  mainSubtitle: {
    fontSize: 18,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
  },
  // ========= FLOWER CARDS =========
  flowersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  flowerCardWrapper: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  flowerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  flowerImageContainer: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowerInfoContainer: {
    padding: 12,
  },
  flowerName: {
    fontSize: 16,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    textAlign: 'right',
    marginBottom: 4,
  },
  flowerDescription: {
    fontSize: 12,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
    textAlign: 'right',
    lineHeight: 17,
    marginBottom: 6,
  },
  flowerIncludesContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
  },
  flowerIncludes: {
    fontSize: 11,
    fontFamily: 'Rubik_400Regular',
    color: '#2D8B8B',
    marginRight: 4,
  },
  flowerPriceRow: {
    alignItems: 'center',
    backgroundColor: '#F0F9F9',
    borderRadius: 8,
    paddingVertical: 6,
  },
  flowerPrice: {
    fontSize: 18,
    fontFamily: 'Rubik_700Bold',
    color: '#2D8B8B',
  },
  // ========= PACKAGE CARDS =========
  packagesContainer: {
    paddingHorizontal: 20,
  },
  packageCardWrapper: {
    marginBottom: 16,
  },
  packageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  packageHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
  },
  packageIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F0E8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  packageTitleContainer: {
    flex: 1,
    marginRight: 14,
  },
  packageName: {
    fontSize: 18,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    textAlign: 'right',
  },
  packageExtra: {
    fontSize: 12,
    fontFamily: 'Rubik_400Regular',
    color: '#D4AF37',
    textAlign: 'right',
    marginTop: 2,
  },
  packageDescription: {
    fontSize: 14,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
    textAlign: 'right',
    lineHeight: 20,
    marginBottom: 14,
  },
  packageFooter: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceTag: {
    alignItems: 'center',
  },
  packagePrice: {
    fontSize: 22,
    fontFamily: 'Rubik_700Bold',
    color: '#2D8B8B',
  },
  priceLabel: {
    fontSize: 11,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
  },
  selectButton: {
    backgroundColor: '#2D8B8B',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Rubik_700Bold',
  },
  // ========= SUCCESS MODAL =========
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#F5F0E8',
    borderRadius: 24,
    padding: 30,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  successCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#2D8B8B',
    marginBottom: 20,
    shadowColor: '#2D8B8B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  successTitle: {
    fontSize: 22,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    textAlign: 'center',
    marginBottom: 8,
  },
  successPackageName: {
    fontSize: 16,
    fontFamily: 'Rubik_400Regular',
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: 28,
  },
  createButton: {
    backgroundColor: '#2D8B8B',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 28,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#2D8B8B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Rubik_700Bold',
    marginLeft: 8,
  },
});

export default PackageOptionsScreen;
