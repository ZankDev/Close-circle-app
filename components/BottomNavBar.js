import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const BottomNavBar = ({ navigation, activeTab, user, token, phoneNumber }) => {
  const tabs = [
    {
      key: 'settings',
      label: 'הגדרות',
      icon: 'settings-outline',
      iconActive: 'settings',
      onPress: () => { if (activeTab !== 'settings') navigation.navigate('Settings', { user, token, phoneNumber }); },
    },
    {
      key: 'packages',
      label: 'חבילות',
      icon: 'pricetag-outline',
      iconActive: 'pricetag',
      onPress: () => { if (activeTab !== 'packages') navigation.navigate('PackageCategories', { user, token, phoneNumber }); },
    },
    {
      key: 'home',
      label: 'בית',
      icon: 'home-outline',
      iconActive: 'home',
      isCenter: true,
      onPress: () => { if (activeTab !== 'home') navigation.navigate('Home', { user, token, phoneNumber }); },
    },
    {
      key: 'help',
      label: 'הדרכה',
      icon: 'play-circle-outline',
      iconActive: 'play-circle',
      onPress: () => { if (activeTab !== 'help') navigation.navigate('Help', { user, token, phoneNumber }); },
    },
    {
      key: 'profile',
      label: 'אזור אישי',
      icon: 'person-outline',
      iconActive: 'person',
      onPress: () => { if (activeTab !== 'profile') navigation.navigate('Profile', { user, token, phoneNumber }); },
    },
  ];

  return (
    <View style={styles.outerContainer}>
      <LinearGradient
        colors={['#F8F5EE', '#EDE6D6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.bar}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;

          /* ── Center "Home" button ── */
          if (tab.isCenter) {
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.centerTab}
                onPress={tab.onPress}
                activeOpacity={0.85}
              >
                <View style={styles.centerShadow}>
                  <LinearGradient
                    colors={isActive ? ['#DDB93C', '#B07B10'] : ['#7A9490', '#4A6B65']}
                    style={styles.centerCircle}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons
                      name={isActive ? 'home' : 'home-outline'}
                      size={24}
                      color="#fff"
                    />
                  </LinearGradient>
                </View>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          }

          /* ── Regular tab ── */
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tab}
              onPress={tab.onPress}
              activeOpacity={0.7}
            >
              {/* Top accent line when active */}
              {isActive && <View style={styles.topAccent} />}

              <View style={[styles.iconBubble, isActive && styles.iconBubbleActive]}>
                <Ionicons
                  name={isActive ? tab.iconActive : tab.icon}
                  size={21}
                  color={isActive ? '#C5A059' : '#9BAAA4'}
                />
              </View>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </View>
  );
};

const CENTER_SIZE = 52;

const styles = StyleSheet.create({
  outerContainer: {
    borderTopWidth: 1,
    borderTopColor: '#CFC8B4',
    shadowColor: '#0D1A16',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 20,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 26 : 10,
    paddingHorizontal: 6,
  },

  /* Regular tab */
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    position: 'relative',
    paddingTop: 4,
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    width: 22,
    height: 3,
    borderRadius: 0,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: '#C5A059',
  },
  iconBubble: {
    width: 36,
    height: 30,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBubbleActive: {
    backgroundColor: 'rgba(197,160,89,0.12)',
  },
  tabLabel: {
    fontSize: 10,
    color: '#9BAAA4',
    fontWeight: '400',
  },
  tabLabelActive: {
    color: '#C5A059',
    fontWeight: '700',
  },

  /* Center "Home" tab */
  centerTab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingTop: 4,
  },
  centerShadow: {
    shadowColor: '#1A2420',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 16,
    borderRadius: CENTER_SIZE / 2,
  },
  centerCircle: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#F8F5EE',
  },
});

export default BottomNavBar;
