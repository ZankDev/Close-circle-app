import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Animated, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const DevFloatingButton = () => {
  const navigation = useNavigation();
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePress = () => {
    navigation.navigate('DevNavigation');
  };

  const handleLongPress = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      {isExpanded && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>לחץ לפתיחת מניו פיתוח</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.8}
      >
        <Ionicons name="code-slash" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2D8B8B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  tooltip: {
    backgroundColor: '#2D5B5B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default DevFloatingButton;
