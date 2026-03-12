import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Rubik_400Regular,
  Rubik_500Medium,
  Rubik_700Bold,
} from '@expo-google-fonts/rubik';
import { flowerOrderService } from '../api/databaseService';

const resolvePaymentUrl = (orderLike, paymentLike) =>
  paymentLike?.checkoutUrl ||
  paymentLike?.paymentUrl ||
  orderLike?.payment?.checkoutUrl ||
  orderLike?.payment?.paymentUrl ||
  null;

const FlowerPaymentScreen = ({ navigation, route }) => {
  const {
    user,
    token,
    addOnSelected = true,
    upsellPrice = 30,
    currency = '₪',
    scheduledDate,
    messageType,
    messageId,
    deliveryAddress: initialAddress = '',
    contactPhone: initialPhone = '',
    contactName: initialContactName = '',
  } = route?.params || {};

  const currencyCode = currency === '₪' ? 'ILS' : currency || 'ILS';

  const [submitting, setSubmitting] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [flowerOrder, setFlowerOrder] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState(initialAddress);
  const [contactPhone, setContactPhone] = useState(initialPhone);
  const [contactName, setContactName] = useState(initialContactName);
  const [notes, setNotes] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [formTouched, setFormTouched] = useState(false);

  const [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_700Bold,
  });

  const submitSelection = useCallback(
    async ({ overrideAddOnSelected = addOnSelected, extraPayload = {} } = {}) => {
      if (!token || !messageId) {
        setErrorMessage('שגיאת מערכת — חסרים פרטי הודעה או התחברות.');
        setSubmitting(false);
        return;
      }

      setSubmitting(true);
      setErrorMessage(null);

      try {
        const payload = {
          addOnSelected: overrideAddOnSelected,
          price: upsellPrice,
          currency: currencyCode,
          scheduledDate:
            scheduledDate instanceof Date
              ? scheduledDate.toISOString()
              : scheduledDate,
          messageType,
          ...extraPayload,
        };

        const response = await flowerOrderService.create(
          token,
          messageId,
          payload,
        );
        const savedOrder = response.flowerOrder || response.order || null;
        const paymentInfo = response.payment || response.paymentDetails || null;

        setFlowerOrder(savedOrder);
        setPaymentDetails(paymentInfo);

        if (savedOrder) {
          if (savedOrder.deliveryAddress) {
            setDeliveryAddress(savedOrder.deliveryAddress);
          }
          if (savedOrder.contactPhone) {
            setContactPhone(savedOrder.contactPhone);
          }
          if (savedOrder.contactName) {
            setContactName(savedOrder.contactName);
          }
          if (savedOrder.notes) {
            setNotes(savedOrder.notes);
          }
        }

        setStatusMessage(response.message || null);
        setValidationErrors({});
        setFormTouched(false);

        return {
          response,
          savedOrder,
          paymentInfo,
          paymentUrl: resolvePaymentUrl(savedOrder, paymentInfo),
        };
      } catch (error) {
        console.error('Flower order submission error:', error);
        setErrorMessage(
          error?.message ||
            'אירעה שגיאה בזמן יצירת הזמנת הפרחים. נסה שוב מאוחר יותר.',
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      token,
      messageId,
      addOnSelected,
      upsellPrice,
      currencyCode,
      scheduledDate,
      messageType,
    ],
  );

  useEffect(() => {
    // If add-on not selected, immediately persist that choice
    if (!addOnSelected) {
      submitSelection({ overrideAddOnSelected: false });
    } else {
      setSubmitting(false);
    }
  }, [addOnSelected, submitSelection]);

  const validateFormDetails = () => {
    if (!addOnSelected) {
      return {};
    }

    const errors = {};

    if (!contactName?.trim()) {
      errors.contactName = 'נא למלא שם מקבל/ת.';
    }

    if (!deliveryAddress?.trim()) {
      errors.deliveryAddress = 'נא למלא כתובת משלוח מלאה.';
    }

    const normalizedPhone = contactPhone?.replace(/[^0-9+]/g, '') || '';
    if (!normalizedPhone || normalizedPhone.length < 8) {
      errors.contactPhone = 'נא להזין מספר טלפון תקין.';
    }

    return errors;
  };

  const refreshStatus = useCallback(async () => {
    if (!token || !messageId) {
      return;
    }

    setCheckingStatus(true);
    try {
      const response = await flowerOrderService.getForMessage(token, messageId);
      const savedOrder = response.flowerOrder || response.order || null;

      setFlowerOrder(savedOrder);
      setPaymentDetails(response.payment || response.paymentDetails || null);

      if (savedOrder) {
        if (savedOrder.deliveryAddress) {
          setDeliveryAddress(savedOrder.deliveryAddress);
        }
        if (savedOrder.contactPhone) {
          setContactPhone(savedOrder.contactPhone);
        }
        if (savedOrder.contactName) {
          setContactName(savedOrder.contactName);
        }
        if (savedOrder.notes) {
          setNotes(savedOrder.notes);
        }
      }

      setStatusMessage(response.message || null);
    } catch (error) {
      console.error('Flower order refresh error:', error);
      Alert.alert(
        'שגיאה',
        error?.message ||
          'אירעה שגיאה בזמן רענון סטטוס הזמנת הפרחים. נסה שוב מאוחר יותר.',
      );
    } finally {
      setCheckingStatus(false);
    }
  }, [token, messageId]);

  const openPaymentLink = (url) => {
    if (!url) {
      Alert.alert(
        'קישור תשלום לא נמצא',
        'לא הצלחנו לאתר קישור לתשלום. נסה לרענן את הסטטוס או ליצור קשר עם התמיכה.',
      );
      return;
    }

    Alert.alert(
      'תשלום',
      'המערכת תפתח את דף התשלום בחלון חדש.',
      [
        {
          text: 'ביטול',
          style: 'cancel',
        },
        {
          text: 'המשך',
          onPress: () => {
            try {
              // eslint-disable-next-line no-undef
              Linking.openURL(url);
            } catch (e) {
              Alert.alert(
                'שגיאה',
                'לא הצלחנו לפתוח את קישור התשלום. נסה שוב מאוחר יותר.',
              );
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handleConfirmDetails = async () => {
    if (!addOnSelected) {
      navigation.goBack();
      return;
    }

    setFormTouched(true);
    const errors = validateFormDetails();
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setErrorMessage('נא להשלים את כל השדות המסומנים.');
      return;
    }

    setErrorMessage(null);

    const result = await submitSelection({
      overrideAddOnSelected: true,
      extraPayload: {
        contactName: contactName.trim(),
        deliveryAddress: deliveryAddress.trim(),
        contactPhone: contactPhone.trim(),
        notes: notes?.trim() || undefined,
      },
    });

    if (result) {
      Alert.alert(
        'נשמר בהצלחה',
        'פרטי משלוח הפרחים נשמרו בהצלחה!',
        [
          {
            text: 'אישור',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  const goToDashboard = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard', params: { user, token } }],
    });
  };

  const priceLabel = `${currency}${upsellPrice}`;
  const paymentUrl = resolvePaymentUrl(flowerOrder, paymentDetails);
  const currentStatus = flowerOrder?.status || (addOnSelected ? null : 'DECLINED');

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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-forward" size={24} color="#2D5B5B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>הוספת משלוח פרחים</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryLeft}>
              <Text style={styles.summaryTitle}>משלוח פרחים יחד עם ההודעה</Text>
              <Text style={styles.summarySubtitle}>
                נצרף למשלוח ההודעה שלך גם זר פרחים אישי ומכובד.
              </Text>
            </View>
            <View style={styles.summaryPriceBadge}>
              <Ionicons name="flower-outline" size={32} color="#EC4899" />
            </View>
          </View>

          {/* Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>פרטי משלוח</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>שם מקבל/ת</Text>
              <TextInput
                style={[
                  styles.textInput,
                  validationErrors.contactName && styles.inputErrorBorder,
                ]}
                value={contactName}
                onChangeText={setContactName}
                placeholder="לדוגמה: אמא"
                placeholderTextColor="#6B7280"
                textAlign="right"
              />
              {formTouched && validationErrors.contactName && (
                <Text style={styles.validationText}>
                  {validationErrors.contactName}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>טלפון ליצירת קשר</Text>
              <TextInput
                style={[
                  styles.textInput,
                  validationErrors.contactPhone && styles.inputErrorBorder,
                ]}
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
                placeholder="מספר נייד"
                placeholderTextColor="#6B7280"
                textAlign="right"
              />
              {formTouched && validationErrors.contactPhone && (
                <Text style={styles.validationText}>
                  {validationErrors.contactPhone}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>כתובת משלוח</Text>
              <TextInput
                style={[
                  styles.textInput,
                  validationErrors.deliveryAddress && styles.inputErrorBorder,
                ]}
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                placeholder="רחוב, מספר בית, עיר"
                placeholderTextColor="#6B7280"
                textAlign="right"
              />
              {formTouched && validationErrors.deliveryAddress && (
                <Text style={styles.validationText}>
                  {validationErrors.deliveryAddress}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>הערות מיוחדות לשליח</Text>
              <TextInput
                style={[styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="לדוגמה: עדיף בשעות הבוקר, שער קוד 1234..."
                placeholderTextColor="#6B7280"
                multiline
                numberOfLines={3}
                textAlign="right"
              />
            </View>
          </View>

          {/* Status / errors */}
          {statusMessage && (
            <View style={styles.statusBox}>
              <Text style={styles.statusText}>{statusMessage}</Text>
            </View>
          )}

          {errorMessage && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {currentStatus && (
            <View style={styles.statusBox}>
              <Text style={styles.statusText}>סטטוס נוכחי: {currentStatus}</Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionsColumn}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleConfirmDetails}
              disabled={submitting}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.primaryButtonGradient}
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={18}
                      color="#ffffff"
                    />
                    <Text style={styles.primaryButtonText}>שמור פרטים</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={refreshStatus}
              disabled={checkingStatus}
            >
              {checkingStatus ? (
                <ActivityIndicator color="#10B981" />
              ) : (
                <Text style={styles.secondaryButtonText}>רענון סטטוס</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.ghostButton]}
              onPress={goToDashboard}
            >
              <Text style={styles.ghostButtonText}>חזרה ללוח הבקרה</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
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
    fontSize: 18,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  summaryCard: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5DED3',
    marginBottom: 24,
  },
  summaryLeft: {
    flex: 1,
    marginLeft: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    textAlign: 'right',
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 13,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
    textAlign: 'right',
  },
  summaryPriceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(16,185,129,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryPrice: {
    fontSize: 18,
    fontFamily: 'Rubik_700Bold',
    color: '#6EE7B7',
  },
  summaryPriceNote: {
    fontSize: 12,
    fontFamily: 'Rubik_400Regular',
    color: '#D1FAE5',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5DED3',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Rubik_700Bold',
    color: '#2D5B5B',
    textAlign: 'right',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Rubik_500Medium',
    color: '#2D5B5B',
    textAlign: 'right',
    marginBottom: 4,
  },
  textInput: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5DED3',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    color: '#2D5B5B',
    fontFamily: 'Rubik_400Regular',
  },
  textArea: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5DED3',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    color: '#2D5B5B',
    fontFamily: 'Rubik_400Regular',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputErrorBorder: {
    borderColor: '#F97373',
  },
  validationText: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: 'Rubik_400Regular',
    color: '#F97373',
    textAlign: 'right',
  },
  statusBox: {
    marginBottom: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(59,130,246,0.08)',
  },
  statusText: {
    fontSize: 13,
    fontFamily: 'Rubik_400Regular',
    color: '#BFDBFE',
    textAlign: 'right',
  },
  errorBox: {
    marginBottom: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'Rubik_500Medium',
    color: '#FCA5A5',
    textAlign: 'right',
  },
  actionsColumn: {
    marginTop: 12,
    gap: 10,
    marginBottom: 24,
  },
  button: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  primaryButton: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Rubik_700Bold',
    color: '#ffffff',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#10B981',
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontFamily: 'Rubik_600SemiBold',
    color: '#10B981',
  },
  ghostButton: {
    borderWidth: 1,
    borderColor: '#E5DED3',
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  ghostButtonText: {
    fontSize: 15,
    fontFamily: 'Rubik_500Medium',
    color: '#2D5B5B',
  },
});

export default FlowerPaymentScreen;
