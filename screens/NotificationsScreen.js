import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Switch,
  I18nManager
} from 'react-native';
import { useFonts, Rubik_400Regular, Rubik_500Medium, Rubik_700Bold } from '@expo-google-fonts/rubik';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    messageReminders: true,
    scheduledMessages: true,
    marketingEmails: false,
    securityAlerts: true,
    folderUpdates: false,
  });

  const [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_700Bold,
  });

  // Enable RTL layout
  useEffect(() => {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('notificationSettings');
      if (savedSettings) {
        setNotifications(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.log('Error loading notification settings:', error);
    }
  };

  const saveNotificationSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.log('Error saving notification settings:', error);
    }
  };

  const toggleNotification = (key) => {
    const newNotifications = {
      ...notifications,
      [key]: !notifications[key]
    };
    setNotifications(newNotifications);
    saveNotificationSettings(newNotifications);
  };

  const NotificationItem = ({ title, description, icon, value, onToggle, iconColor }) => (
    <Animatable.View animation="fadeInUp" duration={600}>
      <View style={styles.notificationItem}>
        <View style={styles.notificationContent}>
          <View style={styles.notificationIcon}>
            <Ionicons name={icon} size={24} color={iconColor} />
          </View>
          <View style={styles.notificationText}>
            <Text style={styles.notificationTitle}>{title}</Text>
            <Text style={styles.notificationDescription}>{description}</Text>
          </View>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#D8D0C4', true: '#2D8B8B' }}
          thumbColor={value ? '#ffffff' : '#9CA3AF'}
          ios_backgroundColor="#D8D0C4"
        />
      </View>
    </Animatable.View>
  );

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient
      colors={['#F5F0E8', '#EDE8E0', '#F8F4ED']}
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
        <Text style={styles.headerTitle}>התראות</Text>
        <View style={styles.placeholder} />
      </Animatable.View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* General Notifications Section */}
        <Animatable.View animation="fadeInUp" duration={600} delay={200}>
          <Text style={styles.sectionTitle}>התראות כלליות</Text>
          <View style={styles.section}>
            <NotificationItem
              title="התראות דחיפה"
              description="קבל התראות על אירועים חשובים באפליקציה"
              icon="notifications"
              iconColor="#2D8B8B"
              value={notifications.pushNotifications}
              onToggle={() => toggleNotification('pushNotifications')}
            />
            <NotificationItem
              title="תזכורות מסרים"
              description="התראות על מסרים שטרם נשלחו"
              icon="time"
              iconColor="#4AA8A8"
              value={notifications.messageReminders}
              onToggle={() => toggleNotification('messageReminders')}
            />
            <NotificationItem
              title="מסרים מתוזמנים"
              description="התראות כאשר מסרים מתוזמנים נשלחים"
              icon="calendar"
              iconColor="#D4A574"
              value={notifications.scheduledMessages}
              onToggle={() => toggleNotification('scheduledMessages')}
            />
          </View>
        </Animatable.View>

        {/* Folder Updates Section */}
        <Animatable.View animation="fadeInUp" duration={600} delay={400}>
          <Text style={styles.sectionTitle}>עדכוני תיקיות</Text>
          <View style={styles.section}>
            <NotificationItem
              title="עדכוני תיקיות"
              description="התראות על שינויים בתיקיות שלך"
              icon="folder"
              iconColor="#10B981"
              value={notifications.folderUpdates}
              onToggle={() => toggleNotification('folderUpdates')}
            />
          </View>
        </Animatable.View>

        {/* Marketing Section */}
        <Animatable.View animation="fadeInUp" duration={600} delay={600}>
          <Text style={styles.sectionTitle}>שיווק</Text>
          <View style={styles.section}>
            <NotificationItem
              title="אימיילי שיווק"
              description="עדכונים על תכונות חדשות והצעות מיוחדות"
              icon="mail"
              iconColor="#4AA8A8"
              value={notifications.marketingEmails}
              onToggle={() => toggleNotification('marketingEmails')}
            />
          </View>
        </Animatable.View>

        {/* Security Section */}
        <Animatable.View animation="fadeInUp" duration={600} delay={800}>
          <Text style={styles.sectionTitle}>אבטחה</Text>
          <View style={styles.section}>
            <NotificationItem
              title="התראות אבטחה"
              description="התראות על פעילות חשודה בחשבון"
              icon="shield-checkmark"
              iconColor="#EF4444"
              value={notifications.securityAlerts}
              onToggle={() => toggleNotification('securityAlerts')}
            />
          </View>
        </Animatable.View>

        {/* Notification Times Section */}
        <Animatable.View animation="fadeInUp" duration={600} delay={1000} style={styles.timesSection}>
          <Text style={styles.sectionTitle}>זמני התראות</Text>
          <View style={styles.section}>
            <TouchableOpacity style={styles.timeOption}>
              <View style={styles.timeContent}>
                <Ionicons name="moon" size={20} color="#2D8B8B" />
                <Text style={styles.timeText}>מצב שקט</Text>
              </View>
              <View style={styles.timeInfo}>
                <Text style={styles.timeValue}>22:00 - 08:00</Text>
                <Ionicons name="chevron-back" size={16} color="#7A8A8A" />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.timeOption}>
              <View style={styles.timeContent}>
                <Ionicons name="volume-high" size={20} color="#10B981" />
                <Text style={styles.timeText}>עוצמת צליל</Text>
              </View>
              <View style={styles.timeInfo}>
                <Text style={styles.timeValue}>בינונית</Text>
                <Ionicons name="chevron-back" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </ScrollView>
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
    backgroundColor: '#F5F0E8',
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
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5DED3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  notificationItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE3',
  },
  notificationContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(45, 139, 139, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: 'Rubik_500Medium',
    color: '#2D5B5B',
    textAlign: 'right',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
    textAlign: 'right',
    lineHeight: 20,
  },
  timesSection: {
    marginBottom: 20,
  },
  timeOption: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE3',
  },
  timeContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontFamily: 'Rubik_500Medium',
    color: '#2D5B5B',
    marginRight: 12,
  },
  timeInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 14,
    fontFamily: 'Rubik_400Regular',
    color: '#7A8A8A',
    marginRight: 8,
  },
});

export default NotificationsScreen;