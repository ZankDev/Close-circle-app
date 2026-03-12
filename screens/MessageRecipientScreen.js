import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CalendarPicker from '../components/CalendarPicker';
import { messageService } from '../api/databaseService';
import { getCurrentUserId } from '../utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MessageRecipientScreen = ({ navigation, route }) => {
  const { user, token, messageType, messageContent, videoUri, audioUri, photoUri, attachmentType } = route.params || {};

  const [recipients, setRecipients] = useState([{ name: '', phone: '', email: '' }]);
  const [sendDate, setSendDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleDateSelected = (date) => {
    setSendDate(date);
    setShowCalendar(false);
  };

  const updateRecipient = (index, field, value) => {
    const updated = [...recipients];
    updated[index] = { ...updated[index], [field]: value };
    setRecipients(updated);
  };

  const addRecipient = () => {
    if (recipients.length < 10) {
      setRecipients([...recipients, { name: '', phone: '', email: '' }]);
    }
  };

  const handleSend = async () => {
    const firstRecipient = recipients[0];
    if (!firstRecipient.name.trim() || !firstRecipient.phone.trim()) {
      Alert.alert('שגיאה', 'אנא מלא לפחות שם וטלפון של הנמען הראשון');
      return;
    }

    if (!sendDate) {
      Alert.alert('שגיאה', 'אנא בחר תאריך לשליחה');
      return;
    }

    setIsSending(true);

    try {
      const type = attachmentType || messageType || 'letter';
      const validRecipients = recipients.filter(r => r.name.trim() && r.phone.trim());
      const scheduledDateStr = new Date(sendDate).toISOString().split('T')[0];
      // Ensure content is always a plain string, never an object
      const safeContent = typeof messageContent === 'string' ? messageContent : null;

      // Try Supabase first; fall back to AsyncStorage when not authenticated
      const userId = await getCurrentUserId();

      if (userId) {
        const msgResult = await messageService.createMessage(userId, {
          type,
          content: safeContent,
          scheduled_date: scheduledDateStr,
          status: 'scheduled',
        });
        if (validRecipients.length > 0) {
          await messageService.addRecipients(
            msgResult.message.id,
            validRecipients.map(r => ({ name: r.name.trim(), phone: r.phone.trim(), email: r.email?.trim() || null }))
          );
        }
      } else {
        // Local fallback — save to AsyncStorage until Supabase auth is active
        const stored = await AsyncStorage.getItem('scheduledMessages');
        const existing = stored ? JSON.parse(stored) : [];
        const newMessage = {
          id: Date.now().toString(),
          type,
          content: safeContent,
          scheduled_date: scheduledDateStr,
          status: 'scheduled',
          recipients: validRecipients,
          videoUri: videoUri || null,
          audioUri: audioUri || null,
          photoUri: photoUri || null,
          createdAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem('scheduledMessages', JSON.stringify([...existing, newMessage]));
      }

      Alert.alert('המסר שוגר!', 'המסר שלך נשמר ויישלח בתאריך שנקבע.', [
        { text: 'אישור', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Home', params: { user, token } }] }) },
      ]);
    } catch (error) {
      console.error('Send message error:', error);
      Alert.alert('שגיאה', error.message || 'לא ניתן לשמור את המסר');
    }

    setIsSending(false);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0E8" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-forward" size={28} color="#2D5B5B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>פרטי שליחה</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Recipient Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={24} color="#C5A059" />
            <Text style={styles.sectionTitle}>למי לשלוח את המסר</Text>
          </View>

          {recipients.map((recipient, index) => (
            <View key={index} style={index > 0 ? styles.recipientExtra : {}}>
              {index > 0 && <View style={styles.recipientDivider} />}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>שם (יכול להיות כינוי) – חובה</Text>
                <TextInput
                  style={styles.input}
                  placeholder="שם הנמען"
                  placeholderTextColor="#9CA3AF"
                  value={recipient.name}
                  onChangeText={(v) => updateRecipient(index, 'name', v)}
                  textAlign="right"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>טלפון – חובה</Text>
                <TextInput
                  style={styles.input}
                  placeholder="05X-XXXXXXX"
                  placeholderTextColor="#9CA3AF"
                  value={recipient.phone}
                  onChangeText={(v) => updateRecipient(index, 'phone', v)}
                  keyboardType="phone-pad"
                  textAlign="right"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>מייל (אופציונלי)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="example@email.com"
                  placeholderTextColor="#9CA3AF"
                  value={recipient.email}
                  onChangeText={(v) => updateRecipient(index, 'email', v)}
                  keyboardType="email-address"
                  textAlign="right"
                />
              </View>
            </View>
          ))}

          {recipients.length < 10 && (
            <TouchableOpacity style={styles.addRecipientBtn} onPress={addRecipient}>
              <Ionicons name="add-circle-outline" size={20} color="#D4AF37" />
              <Text style={styles.addRecipientText}>הוסף נמען נוסף</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={24} color="#C5A059" />
            <Text style={styles.sectionTitle}>קביעת מועד שליחה</Text>
          </View>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowCalendar(true)}
          >
            <Ionicons name="calendar" size={20} color="#D4AF37" />
            <Text style={[styles.dateButtonText, sendDate && styles.dateButtonTextSelected]}>
              {sendDate ? formatDate(sendDate) : 'בחר תאריך'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>סיכום</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryValue}>{messageType}</Text>
            <Text style={styles.summaryLabel}>סוג מסר:</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryValue}>{recipients[0]?.name || '---'}</Text>
            <Text style={styles.summaryLabel}>נמען:</Text>
          </View>
          {recipients.length > 1 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryValue}>{recipients.length} נמענים</Text>
              <Text style={styles.summaryLabel}>סה"כ:</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryValue}>{sendDate ? formatDate(sendDate) : '---'}</Text>
            <Text style={styles.summaryLabel}>תאריך:</Text>
          </View>
        </View>
      </ScrollView>

      {/* Send Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.sendButton, isSending && { opacity: 0.7 }]}
          onPress={handleSend}
          disabled={isSending}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#D4AF37', '#C5A059']}
            style={styles.sendButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isSending ? (
              <Text style={styles.sendButtonText}>שולח...</Text>
            ) : (
              <>
                <Text style={styles.sendButtonText}>שגר מסר</Text>
                <Ionicons name="send" size={22} color="#FFF" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Calendar Modal */}
      {showCalendar && (
        <CalendarPicker
          visible={showCalendar}
          onClose={() => setShowCalendar(false)}
          onDateSelect={handleDateSelected}
          selectedDate={sendDate instanceof Date ? sendDate : new Date()}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DED9CC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5DED3',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D5B5B',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    backgroundColor: '#F7F5EF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#D8D2C2',
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D5B5B',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#7A8A8A',
    marginBottom: 16,
    textAlign: 'right',
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D5B5B',
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#2D5B5B',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  dateButtonTextSelected: {
    color: '#2D5B5B',
    fontWeight: '600',
  },
  flowerToggle: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flowerInfo: {
    flex: 1,
  },
  flowerPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F59E0B',
    marginTop: 4,
    textAlign: 'right',
  },
  recipientExtra: {
    marginTop: 4,
  },
  recipientDivider: {
    height: 1,
    backgroundColor: '#D8D2C2',
    marginBottom: 16,
  },
  addRecipientBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    marginTop: 4,
  },
  addRecipientText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#D4AF37',
  },
  summaryCard: {
    backgroundColor: '#F7F5EF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3E4F46',
    marginBottom: 16,
    textAlign: 'right',
  },
  summaryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D8D2C2',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6F8F90',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 14,
    color: '#3E4F46',
  },
  bottomSection: {
    padding: 20,
  },
  sendButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sendButtonGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default MessageRecipientScreen;
