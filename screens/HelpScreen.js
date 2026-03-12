import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Linking,
  Alert,
  I18nManager
} from 'react-native';
import { useFonts, Rubik_400Regular, Rubik_500Medium, Rubik_700Bold } from '@expo-google-fonts/rubik';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import BottomNavBar from '../components/BottomNavBar';

const HelpScreen = ({ navigation, route }) => {
  const { user, token, phoneNumber } = route?.params || {};
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_700Bold,
  });

  // Enable RTL layout
  useEffect(() => {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
  }, []);

  const faqData = [
    {
      id: 1,
      question: 'איך אני יוצר מסר חדש?',
      answer: 'לאחר בחירת חבילה, לחץ על "צור מסר" בעמוד הבית. בחר את סוג המסר (וידאו, קול, מכתב או פרחים), הוסף את פרטי הנמען ותזמן את תאריך השליחה.'
    },
    {
      id: 2,
      question: 'איך אני יכול לשנות או לבטל מסר?',
      answer: 'כנס לאזור האישי, מצא את המסר תחת "מסרים שתוזמנו", לחץ על כפתור העריכה לשינוי תאריך התזמון, או על כפתור המחיקה לביטול המסר לחלוטין.'
    },
    {
      id: 3,
      question: 'האם המסרים שלי מאובטחים?',
      answer: 'כן, כל המסרים מוצפנים ומאוחסנים בצורה מאובטחת. רק אתה ונמעני המסר יכולים לגשת לתוכן.'
    },
    {
      id: 4,
      question: 'איך אני מוחק חשבון?',
      answer: 'לך להגדרות > פרטיות ואבטחה > מחיקת חשבון. שים לב שפעולה זו בלתי הפיכה ותמחק את כל הנתונים.'
    }
  ];

  const guides = [
    {
      id: 1,
      title: 'מדריך כללי על האפליקציה',
      icon: 'book-outline',
      color: '#C5A059',
    },
    {
      id: 2,
      title: 'מדריך ליצירת מסר ראשון',
      description: 'בחירת חבילה ותהליך יצירת מסר וידאו / אודיו + מכתב',
      icon: 'videocam-outline',
      color: '#5F7F85',
    },
    {
      id: 3,
      title: 'מדריך להזמנת זר פרחים',
      icon: 'flower-outline',
      color: '#7A8F74',
    },
    {
      id: 4,
      title: 'מדריך לשינוי או ביטול דרך אזור אישי',
      icon: 'person-outline',
      color: '#6F8F90',
    },
  ];

  const contactOptions = [
    {
      id: 1,
      title: 'אימייל',
      description: 'שלח לנו הודעה ונחזור אליך בהקדם האפשרי',
      icon: 'mail',
      color: '#7A8F74',
      action: () => Linking.openURL('mailto:support@messages.app')
    },
    {
      id: 2,
      title: 'WhatsApp',
      description: 'שלח לנו הודעה בוואטסאפ ונחזור אליך בהקדם האפשרי',
      icon: 'logo-whatsapp',
      color: '#25D366',
      action: () => Linking.openURL('https://wa.me/972501234567')
    }
  ];


  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const FAQItem = ({ item }) => (
    <Animatable.View animation="fadeInUp" duration={600}>
      <TouchableOpacity 
        style={styles.faqItem}
        onPress={() => toggleFAQ(item.id)}
      >
        <View style={styles.faqQuestion}>
          <Text style={styles.faqQuestionText}>{item.question}</Text>
          <Ionicons 
            name={expandedFAQ === item.id ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#2D8B8B" 
          />
        </View>
        {expandedFAQ === item.id && (
          <Animatable.View animation="fadeInDown" duration={300}>
            <Text style={styles.faqAnswer}>{item.answer}</Text>
          </Animatable.View>
        )}
      </TouchableOpacity>
    </Animatable.View>
  );

  const ContactItem = ({ item }) => (
    <Animatable.View animation="fadeInUp" duration={600}>
      <TouchableOpacity 
        style={styles.contactItem}
        onPress={item.action}
      >
        <View style={styles.contactContent}>
          <View style={[styles.contactIcon, { backgroundColor: `${item.color}20` }]}>
            <Ionicons name={item.icon} size={24} color={item.color} />
          </View>
          <View style={styles.contactText}>
            <Text style={styles.contactTitle}>{item.title}</Text>
            <Text style={styles.contactDescription}>{item.description}</Text>
          </View>
        </View>
        <Ionicons name="chevron-back" size={20} color="#7A8A8A" />
      </TouchableOpacity>
    </Animatable.View>
  );

  const TutorialItem = ({ item }) => (
    <Animatable.View animation="fadeInUp" duration={600}>
      <TouchableOpacity 
        style={styles.tutorialItem}
        onPress={() => Alert.alert('מדריך', `פתיחת מדריך: ${item.title}`)}
      >
        <View style={styles.tutorialContent}>
          <View style={[styles.tutorialIcon, { backgroundColor: `${item.color}20` }]}>
            <Ionicons name={item.icon} size={24} color={item.color} />
          </View>
          <View style={styles.tutorialText}>
            <Text style={styles.tutorialTitle}>{item.title}</Text>
            {item.description ? <Text style={styles.tutorialDescription}>{item.description}</Text> : null}
          </View>
        </View>
        <Ionicons name="play" size={20} color="#C5A059" />
      </TouchableOpacity>
    </Animatable.View>
  );

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient
      colors={['#F5F0E8', '#FFFFFF', '#F5F0E8']}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0E8" />
      
      {/* Header */}
      <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-forward" size={24} color="#2D5B5B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>עזרה ותמיכה</Text>
        <View style={styles.placeholder} />
      </Animatable.View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Guides Section */}
        <Animatable.View animation="fadeInUp" duration={600} delay={200}>
          <Text style={styles.sectionTitle}>מדריכים</Text>
          <View style={styles.tutorialsSection}>
            {guides.map(item => (
              <TutorialItem key={item.id} item={item} />
            ))}
          </View>
        </Animatable.View>

        {/* FAQ Section */}
        <Animatable.View animation="fadeInUp" duration={600} delay={400}>
          <Text style={styles.sectionTitle}>שאלות נפוצות</Text>
          <View style={styles.faqSection}>
            {faqData.map(item => (
              <FAQItem key={item.id} item={item} />
            ))}
          </View>
        </Animatable.View>

        {/* Contact Section */}
        <Animatable.View animation="fadeInUp" duration={600} delay={600}>
          <Text style={styles.sectionTitle}>צור קשר</Text>
          <View style={styles.contactSection}>
            {contactOptions.map(item => (
              <ContactItem key={item.id} item={item} />
            ))}
          </View>
        </Animatable.View>

        {/* App Info */}
        <Animatable.View animation="fadeInUp" duration={600} delay={1000} style={styles.appInfo}>
          <Text style={styles.appInfoTitle}>פרטי האפליקציה</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>גרסה</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>עדכון אחרון</Text>
              <Text style={styles.infoValue}>13/10/2025</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>מזהה מכשיר</Text>
              <Text style={styles.infoValue}>ABC-123-XYZ</Text>
            </View>
          </View>
        </Animatable.View>
      </ScrollView>
      <BottomNavBar navigation={navigation} activeTab="help" user={user} token={token} phoneNumber={phoneNumber} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5DED3',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#E5DED3',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    textAlign: 'right',
    marginTop: 30,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row-reverse',
    gap: 12,
  },
  quickAction: {
    flex: 1,
  },
  quickActionGradient: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontFamily: 'Rubik_700Bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  faqSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5DED3',
    overflow: 'hidden',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5DED3',
  },
  faqQuestion: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    fontFamily: 'Rubik_500Medium',
    color: '#2D5B5B',
    flex: 1,
    textAlign: 'right',
  },
  faqAnswer: {
    fontSize: 14,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
    paddingHorizontal: 16,
    paddingBottom: 16,
    lineHeight: 22,
    textAlign: 'right',
  },
  tutorialsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5DED3',
    gap: 4,
  },
  tutorialItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5DED3',
  },
  tutorialContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  tutorialIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  tutorialText: {
    flex: 1,
  },
  tutorialTitle: {
    fontSize: 16,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    textAlign: 'right',
    marginBottom: 4,
  },
  tutorialDescription: {
    fontSize: 14,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
    textAlign: 'right',
    marginBottom: 4,
  },
  tutorialDuration: {
    fontSize: 12,
    fontFamily: 'Rubik_500Medium',
    color: '#2D8B8B',
    textAlign: 'right',
  },
  contactSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5DED3',
    gap: 4,
  },
  contactItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5DED3',
  },
  contactContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    textAlign: 'right',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
    textAlign: 'right',
    lineHeight: 20,
  },
  appInfo: {
    marginTop: 30,
  },
  appInfoTitle: {
    fontSize: 18,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    textAlign: 'right',
    marginBottom: 16,
  },
  infoGrid: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5DED3',
  },
  infoItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
  },
});

export default HelpScreen;