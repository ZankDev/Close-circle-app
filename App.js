import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './screens/LoginScreen';
import OTPVerificationScreen from './screens/OTPVerificationScreen';
import RegistrationStep1Screen from './screens/RegistrationStep1Screen';
import RegistrationStep3Screen from './screens/RegistrationStep3Screen';
import WelcomeScreen from './screens/WelcomeScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import PrivacyScreen from './screens/PrivacyScreen';
import SubscriptionScreen from './screens/SubscriptionScreen';
import HelpScreen from './screens/HelpScreen';
import CreateMessageScreen from './screens/CreateMessageScreen';
import VideoRecordingScreen from './screens/VideoRecordingScreen';
import TextMessageScreen from './screens/TextMessageScreen';
import VoiceRecordingScreen from './screens/VoiceRecordingScreen';
import PhotoMessageScreen from './screens/PhotoMessageScreen';
import MessageRecipientScreen from './screens/MessageRecipientScreen';
import FlowerPaymentScreen from './screens/FlowerPaymentScreen';
import DevNavigationScreen from './screens/DevNavigationScreen';
import LandingScreen from './screens/LandingScreen';
import PasswordSetupScreen from './screens/PasswordSetupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import PackageCategoriesScreen from './screens/PackageCategoriesScreen';
import PackageOptionsScreen from './screens/PackageOptionsScreen';
import SettingsScreen from './screens/SettingsScreen';
import VideoSendScreen from './screens/VideoSendScreen';
import MessageDetailScreen from './screens/MessageDetailScreen';
import DevFloatingButton from './components/DevFloatingButton';

const Stack = createStackNavigator();

function AppContent() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#F5F0E8" />
      <Stack.Navigator 
        initialRouteName="Landing"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="Landing" 
          component={LandingScreen} 
        />
        <Stack.Screen 
          name="DevNavigation" 
          component={DevNavigationScreen} 
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
        />
        <Stack.Screen 
          name="OTPVerification" 
          component={OTPVerificationScreen}
        />
        <Stack.Screen 
          name="PasswordSetup" 
          component={PasswordSetupScreen}
        />
        <Stack.Screen 
          name="ForgotPassword" 
          component={ForgotPasswordScreen}
        />
        <Stack.Screen 
          name="RegistrationStep1" 
          component={RegistrationStep1Screen}
        />
        <Stack.Screen 
          name="RegistrationStep3" 
          component={RegistrationStep3Screen}
        />
        <Stack.Screen 
          name="WelcomeScreen" 
          component={WelcomeScreen}
        />
        <Stack.Screen 
          name="PackageCategories" 
          component={PackageCategoriesScreen}
        />
        <Stack.Screen 
          name="PackageOptions" 
          component={PackageOptionsScreen}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Notifications" 
          component={NotificationsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Privacy" 
          component={PrivacyScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Subscription" 
          component={SubscriptionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Help" 
          component={HelpScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="CreateMessage" 
          component={CreateMessageScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="VideoRecording" 
          component={VideoRecordingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="TextMessage" 
          component={TextMessageScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="VoiceRecording" 
          component={VoiceRecordingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="PhotoMessage" 
          component={PhotoMessageScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="MessageRecipient" 
          component={MessageRecipientScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="VideoSend" 
          component={VideoSendScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="FlowerPayment" 
          component={FlowerPaymentScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="MessageDetail" 
          component={MessageDetailScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
      <DevFloatingButton />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <AppContent />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});