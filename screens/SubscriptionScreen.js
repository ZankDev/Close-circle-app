import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  I18nManager
} from 'react-native';
import { useFonts, Rubik_400Regular, Rubik_500Medium, Rubik_700Bold } from '@expo-google-fonts/rubik';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import BottomNavBar from '../components/BottomNavBar';
import { subscriptionService } from '../api/databaseService';
import { getCurrentUserId } from '../utils/supabase';
import {
  showPaymentConfirmation,
  showCancelSubscriptionConfirmation,
} from '../utils/dangerousActions';

const SubscriptionScreen = ({ navigation, route }) => {
  const { user, token } = route.params || {};
  const [currentPlan, setCurrentPlan] = useState('basic');
  const [userPackages, setUserPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const plans = {
    basic: {
      name: 'Basic Package',
      hebrewName: 'חבילת בסיס',
      maxMessages: 1,
      price: 99,
      description: 'מסר אחד לשמירה לעתיד',
      features: ['מסר אחד מוקלט', 'שמירה מאובטחת לעתיד', 'שליחה אוטומטית במועד', 'תמיכה מסורה'],
      color: '#2D8B8B',
      popular: false
    },
    standard: {
      name: 'Standard Package',
      hebrewName: 'חבילת סטנדרט',
      maxMessages: 5,
      price: 299,
      description: '5 מסרים לשמירה לעתיד',
      features: ['5 מסרי אהבה', 'ארגון בתיקיות', 'תזמון מדויק לשנים קדימה', 'הצפנה מלאה', 'תמיכה אישית'],
      color: '#4AA8A8',
      popular: true
    },
    premium: {
      name: 'Premium Package',
      hebrewName: 'חבילת פרימיום',
      maxMessages: 15,
      price: 599,
      description: '15 מסרים לשמירה לעתיד',
      features: ['15 מסרי נצח', 'כל התכונות הפרמיום', 'תזמון גמיש לעשורים', 'גיבוי מוצפן בענן', 'תמיכה טלפונית 24/7'],
      color: '#5BB9B9',
      popular: false
    }
  };

  const [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_700Bold,
  });

  // Enable RTL layout + load user packages on mount
  useEffect(() => {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
    loadUserPackages();
  }, []);

  const loadUserPackages = async () => {
    try {
      const userId = await getCurrentUserId();
      if (userId) {
        const result = await subscriptionService.getUserPackages(userId);
        setUserPackages(result.packages || []);
        // Determine "current plan" from first active package (UI only)
        if (result.packages?.length > 0) {
          setCurrentPlan(result.packages[0].package_id || 'basic');
        }
      }
    } catch (e) {
      console.error('Load packages error:', e);
    }
  };

  const updateSubscriptionOnServer = async (planKey) => {
    try {
      setIsLoading(true);
      const userId = await getCurrentUserId();
      if (!userId) return false;

      // Record purchase in user_packages table
      // (In production, this would be triggered after successful payment)
      await subscriptionService.purchasePackage(
        userId,
        planKey, // packageId (using planKey as placeholder — production: use actual UUID)
        plans[planKey]?.maxMessages || 1
      );

      setCurrentPlan(planKey);
      await loadUserPackages();
      return true;
    } catch (error) {
      console.error('Subscription update error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = (planKey) => {
    if (planKey === currentPlan) {
      Alert.alert('מידע', 'זוהי התוכנית הנוכחית שלך');
      return;
    }

    showPaymentConfirmation(
      `₪${plans[planKey].price}`,
      plans[planKey].hebrewName,
      async () => {
        const success = await updateSubscriptionOnServer(planKey);
        if (success) {
          setCurrentPlan(planKey);
          Alert.alert(
            'הצלחה! 🎉',
            `התוכנית שודרגה בהצלחה ל${plans[planKey].hebrewName}!\n\nכעת תוכל ליצור עד ${plans[planKey].maxMessages} מסרים.`,
            [
              {
                text: 'חזור לדשבורד',
                onPress: () => navigation.goBack()
              }
            ]
          );
        } else {
          Alert.alert('שגיאה', 'אירעה שגיאה בעדכון התוכנית. אנא נסה שנית.');
        }
      }
    );
  };

  const handleBillingHistory = () => {
    Alert.alert('היסטוריית חיובים', 'תכונה זו תהיה זמינה בקרוב');
  };

  const handleCancelPackage = () => {
    showCancelSubscriptionConfirmation(
      () => {
        Alert.alert('חבילה בוטלה', 'החבילה שלך בוטלה בהצלחה. ביטול אפשרי רק כל עוד לא תוזמן מסר.');
      }
    );
  };

  const PlanCard = ({ planKey, plan, isCurrentPlan }) => {
    if (!plan) return null;
    
    return (
      <Animatable.View animation="fadeInUp" duration={600}>
        <View style={[styles.planCard, isCurrentPlan && styles.currentPlanCard]}>
          {plan.popular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>הכי פופולרי</Text>
            </View>
          )}
        
        <LinearGradient
          colors={[plan.color, `${plan.color}80`]}
          style={styles.planHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.planName}>{plan?.hebrewName || 'טוען...'}</Text>
          <Text style={styles.planSubname}>{plan?.name || 'טוען...'}</Text>
          {isCurrentPlan && (
            <View style={styles.currentBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#ffffff" />
              <Text style={styles.currentBadgeText}>תוכנית נוכחית</Text>
            </View>
          )}
        </LinearGradient>

        <View style={styles.planContent}>
          <View style={styles.priceSection}>
            <View style={styles.priceContainer}>
            <Text style={styles.price}>₪{plan?.price || 0}</Text>
            <Text style={styles.pricePeriod}>תשלום חד פעמי</Text>
          </View>
          <Text style={styles.description}>{plan?.description || ''}</Text>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>מה כלול:</Text>
          {(plan?.features || []).map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark" size={16} color={plan?.color || '#2D8B8B'} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity 
            style={[
              styles.planButton,
              isCurrentPlan ? styles.currentPlanButton : { backgroundColor: plan?.color || '#2D8B8B' },
              isLoading && styles.disabledButton
            ]}
            onPress={() => handleUpgrade(planKey)}
            disabled={isCurrentPlan || isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>מעדכן...</Text>
              </View>
            ) : (
              <Text style={[
                styles.planButtonText,
                isCurrentPlan && { color: '#7A8A8A' }
              ]}>
                {isCurrentPlan ? 'חבילה נוכחית' : 'רכוש חבילה'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Animatable.View>
    );
  };

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
        <Text style={styles.headerTitle}>חבילות מסרים</Text>
        <View style={styles.placeholder} />
      </Animatable.View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Description */}
        <Animatable.View animation="fadeInUp" duration={600} delay={200} style={styles.descriptionSection}>
          <Text style={styles.descriptionTitle}>השאר את המסרים הכי חשובים שלך לאהובים</Text>
          <Text style={styles.descriptionText}>
            צור מסרים אישיים מלאי אהבה, זכרונות ותמונות שיישלחו למשפחתך ולחבריך בזמנים המתאימים. 
            כל מסר יישמר בבטחה ויגיע בדיוק במועד שבחרת - מתנה של אהבה לעתיד.
          </Text>
        </Animatable.View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {Object.entries(plans).map(([planKey, plan]) => (
            <PlanCard 
              key={planKey}
              planKey={planKey}
              plan={plan}
              isCurrentPlan={planKey === currentPlan}
            />
          ))}
        </View>

        {/* Management Section */}
        <Animatable.View animation="fadeInUp" duration={600} delay={800}>
          <Text style={styles.sectionTitle}>ניהול חבילה</Text>
          <View style={styles.managementSection}>
            <TouchableOpacity 
              style={styles.managementItem}
              onPress={handleBillingHistory}
            >
              <View style={styles.managementContent}>
                <Ionicons name="receipt" size={24} color="#7A8F74" />
                <Text style={styles.managementText}>היסטוריית חיובים וחשבוניות</Text>
              </View>
              <Ionicons name="chevron-back" size={20} color="#7A8A8A" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.managementItem}
              onPress={() => Alert.alert('אמצעי תשלום', 'ניהול אמצעי תשלום יהיה זמין בקרוב')}
            >
              <View style={styles.managementContent}>
                <Ionicons name="card" size={24} color="#5F7F85" />
                <Text style={styles.managementText}>אמצעי תשלום</Text>
              </View>
              <Ionicons name="chevron-back" size={20} color="#7A8A8A" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.managementItem, styles.dangerItem]}
              onPress={handleCancelPackage}
            >
              <View style={styles.managementContent}>
                <Ionicons name="close-circle" size={24} color="#EF4444" />
                <Text style={[styles.managementText, { color: '#EF4444' }]}>ביטול חבילה</Text>
              </View>
              <Ionicons name="chevron-back" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* Current Plan Summary */}
        <Animatable.View animation="fadeInUp" duration={600} delay={1000} style={styles.summarySection}>
          <Text style={styles.summaryTitle}>החבילה הנוכחית שלך</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>חבילה נוכחית:</Text>
              <Text style={styles.summaryValue}>{plans[currentPlan].hebrewName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>מסרים זמינים:</Text>
              <Text style={styles.summaryValue}>
                {plans[currentPlan].maxMessages} מסרים
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>תאריך רכישה:</Text>
              <Text style={styles.summaryValue}>15/10/2025</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>סכום ששולם:</Text>
              <Text style={styles.summaryValue}>
                ₪{plans[currentPlan].price}
              </Text>
            </View>
          </View>
        </Animatable.View>
      </ScrollView>
      <BottomNavBar navigation={navigation} activeTab="packages" user={user} token={token} phoneNumber={user?.phoneNumber} />
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
  descriptionSection: {
    marginTop: 20,
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5DED3',
  },
  descriptionTitle: {
    fontSize: 20,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    textAlign: 'right',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
    textAlign: 'right',
    lineHeight: 24,
  },
  toggleContainer: {
    flexDirection: 'row-reverse',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E5DED3',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#2D8B8B',
  },
  toggleText: {
    fontSize: 16,
    fontFamily: 'Rubik_500Medium',
    color: '#7A8A8A',
  },
  activeToggleText: {
    color: '#ffffff',
  },
  toggleSavings: {
    fontSize: 12,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
    marginTop: 2,
  },
  activeToggleSavings: {
    color: '#ffffff',
  },
  plansContainer: {
    gap: 20,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5DED3',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  currentPlanCard: {
    borderColor: '#2D8B8B',
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#2D8B8B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  popularText: {
    fontSize: 12,
    fontFamily: 'Rubik_700Bold',
    color: '#ffffff',
  },
  planHeader: {
    padding: 20,
    alignItems: 'center',
  },
  planName: {
    fontSize: 24,
    fontFamily: 'Rubik_700Bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  planSubname: {
    fontSize: 14,
    fontFamily: 'Rubik_400Regular',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  currentBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  currentBadgeText: {
    fontSize: 12,
    fontFamily: 'Rubik_500Medium',
    color: '#ffffff',
  },
  planContent: {
    padding: 20,
  },
  priceSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  priceContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  price: {
    fontSize: 32,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
  },
  pricePeriod: {
    fontSize: 16,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
    marginRight: 4,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Rubik_500Medium',
    color: '#2D8B8B',
    textAlign: 'center',
  },
  featuresSection: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    textAlign: 'right',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
    flex: 1,
    textAlign: 'right',
  },
  planButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  currentPlanButton: {
    backgroundColor: '#E5DED3',
  },
  planButtonText: {
    fontSize: 16,
    fontFamily: 'Rubik_700Bold',
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    textAlign: 'right',
    marginTop: 40,
    marginBottom: 16,
  },
  managementSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5DED3',
  },
  managementItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5DED3',
  },
  managementContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  managementText: {
    fontSize: 16,
    fontFamily: 'Rubik_500Medium',
    color: '#2D5B5B',
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  summarySection: {
    marginTop: 30,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    textAlign: 'right',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5DED3',
  },
  summaryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Rubik_500Medium',
    color: 'white',
  },
});

export default SubscriptionScreen;
