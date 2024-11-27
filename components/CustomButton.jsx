import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import React from 'react';

const CustomButton = ({ title, handlePress, containerStyles, textStyles, isLoading }) => {
  return (
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={0.7}
      style={[styles.button, containerStyles, isLoading && styles.loading]}
      disabled={isLoading}
    >
      <Text style={[styles.text, textStyles]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'lightgreen',
    borderRadius: 10,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'primary', // Adjust color as needed
    fontWeight: '600',
    fontSize: 18,
  },
  loading: {
    opacity: 0.5,
  },
});

export default CustomButton;
