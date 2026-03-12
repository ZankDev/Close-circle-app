import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const TextMessageScreen = ({ navigation, route }) => {
  const { user, token } = route.params || {};
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const handleNext = () => {
    if (!message.trim()) {
      Alert.alert('שגיאה', 'אנא כתוב את המסר');
      return;
    }

    navigation.navigate('MessageRecipient', {
      user,
      token,
      messageType: 'text',
      messageContent: {
        title: title.trim(),
        text: message.trim(),
      },
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
        <Text style={styles.headerTitle}>מסר טקסט</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title Input */}
          <View style={styles.inputSection}>
            <View style={styles.labelRow}>
              <Ionicons name="bookmark-outline" size={20} color="#3B82F6" />
              <Text style={styles.label}>כותרת (אופציונלי)</Text>
            </View>
            <TextInput
              style={styles.titleInput}
              placeholder="הוסף כותרת למסר שלך"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
              textAlign="right"
            />
          </View>

          {/* Message Input */}
          <View style={styles.inputSection}>
            <View style={styles.labelRow}>
              <Ionicons name="document-text-outline" size={20} color="#3B82F6" />
              <Text style={styles.label}>המסר שלך</Text>
            </View>
            <TextInput
              style={styles.messageInput}
              placeholder="כתוב את המסר שלך כאן..."
              placeholderTextColor="#9CA3AF"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={12}
              textAlignVertical="top"
              textAlign="right"
            />
            <Text style={styles.charCount}>
              {message.length} תווים
            </Text>
          </View>
        </ScrollView>

        {/* Next Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#3B82F6', '#60A5FA']}
              style={styles.nextButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.nextButtonText}>המשך</Text>
              <Ionicons name="arrow-back" size={22} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D5B5B',
  },
  titleInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2D5B5B',
    borderWidth: 1,
    borderColor: '#E5DED3',
  },
  messageInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2D5B5B',
    minHeight: 300,
    borderWidth: 1,
    borderColor: '#E5DED3',
  },
  charCount: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'left',
    marginTop: 8,
  },
  bottomSection: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 30,
  },
  nextButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonGradient: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default TextMessageScreen;
