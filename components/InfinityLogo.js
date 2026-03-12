import React from 'react';
import { View, StyleSheet } from 'react-native';

// Simple infinity logo using basic shapes (no SVG dependency)
export const InfinityLogoSimple = ({ size = 40, style }) => {
  return (
    <View style={[styles.simpleContainer, { width: size * 2, height: size }, style]}>
      <View style={[styles.circle, styles.leftCircle, { 
        width: size * 0.8, 
        height: size * 0.8,
        borderRadius: size * 0.4,
      }]} />
      <View style={[styles.circle, styles.rightCircle, { 
        width: size * 0.8, 
        height: size * 0.8,
        borderRadius: size * 0.4,
      }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  simpleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    borderWidth: 3,
    borderColor: '#D4AF37',
    backgroundColor: 'transparent',
  },
  leftCircle: {
    marginRight: -10,
  },
  rightCircle: {
    marginLeft: -10,
  },
});

export default InfinityLogoSimple;
