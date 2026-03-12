import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Rubik_400Regular, Rubik_500Medium, Rubik_700Bold } from '@expo-google-fonts/rubik';

const { width } = Dimensions.get('window');

const MESSAGE_TYPES = [
  {
    id: 'video',
    title: 'מסר וידאו',
    subtitle: 'סרטון אישי עד 2 דקות',
    detail: 'הקלט סרטון ישירות מהמצלמה, מלא רגש ונוכחות',
    icon: 'videocam-outline',
    accentIcon: 'film-outline',
    screen: 'VideoRecording',
    goldShade: '#C5A059',
  },
  {
    id: 'voice',
    title: 'מסר קולי',
    subtitle: 'הקלטה קולית עד חצי שעה',
    detail: 'קולך הוא המתנה – הקלט הודעה עמוקה בקולך האישי',
    icon: 'mic-outline',
    accentIcon: 'musical-notes-outline',
    screen: 'VoiceRecording',
    goldShade: '#B8955A',
  },
  {
    id: 'text',
    title: 'מכתב / ברכה',
    subtitle: 'טקסט עם רקע מעוצב',
    detail: 'כתוב מכתב מהלב עם רקעים יפים ובחירת גופן',
    icon: 'mail-outline',
    accentIcon: 'pencil-outline',
    screen: 'TextMessage',
    goldShade: '#A8884E',
  },
  {
    id: 'photo',
    title: 'תמונה מהעבר',
    subtitle: 'זיכרון חזותי אישי',
    detail: 'שתף תמונה יקרה מאלבום הזיכרונות שלך',
    icon: 'image-outline',
    accentIcon: 'heart-outline',
    screen: 'PhotoMessage',
    goldShade: '#C5A059',
  },
];

const CreateMessageScreen = ({ navigation, route }) => {
  const { user, token } = route.params || {};

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnims = useRef(MESSAGE_TYPES.map(() => new Animated.Value(40))).current;

  const [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_700Bold,
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    MESSAGE_TYPES.forEach((_, i) => {
      Animated.timing(slideAnims[i], {
        toValue: 0,
        duration: 420,
        delay: 80 + i * 90,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const handleSelectType = (type) => {
    navigation.navigate(type.screen, { user, token });
  };

  if (!fontsLoaded) return null;

  return (
    <LinearGradient
      colors={['#B8CFC8', '#C2CEC4', '#DED9CC']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#B8CFC8" />

        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-forward" size={22} color="#3E4F46" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerLabel}>צור מסר</Text>
          </View>

          <View style={styles.headerRight} />
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero text */}
          <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
            <View style={styles.goldLine} />
            <Text style={styles.heroTitle}>איזה מסר תשלח?</Text>
            <Text style={styles.heroSubtitle}>
              בחר את הפורמט שמדבר בשבילך
            </Text>
          </Animated.View>

          {/* Cards */}
          <View style={styles.cardsWrapper}>
            {MESSAGE_TYPES.map((type, index) => (
              <Animated.View
                key={type.id}
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnims[index] }],
                  marginBottom: 14,
                }}
              >
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => handleSelectType(type)}
                  activeOpacity={0.88}
                >
                  {/* Gold left accent bar */}
                  <View style={[styles.cardAccent, { backgroundColor: type.goldShade }]} />

                  {/* Icon circle */}
                  <View style={[styles.iconCircle, { borderColor: type.goldShade }]}>
                    <Ionicons name={type.icon} size={28} color={type.goldShade} />
                  </View>

                  {/* Text */}
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{type.title}</Text>
                    <Text style={styles.cardSubtitle}>{type.subtitle}</Text>
                    <Text style={styles.cardDetail}>{type.detail}</Text>
                  </View>

                  {/* Arrow */}
                  <View style={styles.arrowWrap}>
                    <Ionicons name="chevron-back" size={18} color="#C5A059" />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* Bottom note */}
          <Animated.View style={[styles.noteRow, { opacity: fadeAnim }]}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#7A8F74" />
            <Text style={styles.noteText}>
              כל המסרים מוצפנים ומאוחסנים בבטחה עד למועד השליחה
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(247,245,239,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8D2C2',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 19,
    fontFamily: 'Rubik_700Bold',
    color: '#3E4F46',
  },
  headerRight: {
    width: 40,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },

  heroSection: {
    alignItems: 'flex-end',
    marginTop: 8,
    marginBottom: 28,
  },
  goldLine: {
    width: 44,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#D4AF37',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 27,
    fontFamily: 'Rubik_700Bold',
    color: '#3E4F46',
    textAlign: 'right',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 15,
    fontFamily: 'Rubik_400Regular',
    color: '#6F8F90',
    textAlign: 'right',
  },

  cardsWrapper: {
    marginBottom: 10,
  },

  card: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#F7F5EF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#3E4F46',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E8E2D4',
    minHeight: 96,
  },
  cardAccent: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginRight: 16,
    marginLeft: 4,
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  cardText: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontFamily: 'Rubik_700Bold',
    color: '#3E4F46',
    textAlign: 'right',
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: 'Rubik_500Medium',
    color: '#C5A059',
    textAlign: 'right',
    marginBottom: 4,
  },
  cardDetail: {
    fontSize: 12,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
    textAlign: 'right',
    lineHeight: 17,
  },
  arrowWrap: {
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  noteRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(247,245,239,0.6)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D8D2C2',
    marginTop: 4,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Rubik_400Regular',
    color: '#6F8F90',
    textAlign: 'right',
    lineHeight: 19,
  },
});

export default CreateMessageScreen;
