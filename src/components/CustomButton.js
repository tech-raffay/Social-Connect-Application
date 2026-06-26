import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

export const CustomButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary', // 'primary' | 'secondary' | 'outline'
  style,
  textStyle,
  ...props
}) => {
  const isButtonDisabled = disabled || loading;

  const getButtonStyles = () => {
    switch (variant) {
      case 'secondary':
        return [styles.button, styles.secondaryButton, isButtonDisabled && styles.disabledButton, style];
      case 'outline':
        return [styles.button, styles.outlineButton, isButtonDisabled && styles.disabledOutlineButton, style];
      case 'primary':
      default:
        return [styles.button, styles.primaryButton, isButtonDisabled && styles.disabledButton, style];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return [styles.text, styles.outlineText, isButtonDisabled && styles.disabledOutlineText, textStyle];
      case 'secondary':
      case 'primary':
      default:
        return [styles.text, styles.primaryText, isButtonDisabled && styles.disabledText, textStyle];
    }
  };

  const getLoaderColor = () => {
    return variant === 'outline' ? COLORS.primary : COLORS.white;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isButtonDisabled}
      activeOpacity={0.8}
      style={getButtonStyles()}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getLoaderColor()} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledButton: {
    backgroundColor: COLORS.surfaceLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledOutlineButton: {
    borderColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    ...TYPOGRAPHY.bodyBold,
    letterSpacing: 0.5,
  },
  primaryText: {
    color: COLORS.white,
  },
  outlineText: {
    color: COLORS.primary,
  },
  disabledText: {
    color: COLORS.textMuted,
  },
  disabledOutlineText: {
    color: COLORS.textMuted,
  },
});
export default CustomButton;
