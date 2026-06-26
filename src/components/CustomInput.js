import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';

export const CustomInput = ({
  label,
  error,
  touched,
  secureTextEntry = false,
  containerStyle,
  style,
  onFocus: externalOnFocus,
  onBlur: externalOnBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(!secureTextEntry);

  const hasError = error && touched;

  const getInputContainerStyle = () => {
    if (hasError) {
      return [styles.inputContainer, styles.inputContainerError];
    }
    if (isFocused) {
      return [styles.inputContainer, styles.inputContainerFocused];
    }
    return styles.inputContainer;
  };

  const getLabelStyle = () => {
    if (hasError) {
      return [styles.label, styles.labelError];
    }
    if (isFocused) {
      return [styles.label, styles.labelFocused];
    }
    return styles.label;
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    if (externalOnFocus) externalOnFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (externalOnBlur) externalOnBlur(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={getLabelStyle()}>{label}</Text>}
      
      <View style={getInputContainerStyle()}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={secureTextEntry && !passwordVisible}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setPasswordVisible(!passwordVisible)}
            style={styles.toggleButton}
          >
            <Text style={styles.toggleText}>
              {passwordVisible ? 'HIDE' : 'SHOW'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
    width: '100%',
  },
  label: {
    ...TYPOGRAPHY.subbody,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  labelFocused: {
    color: COLORS.primary,
  },
  labelError: {
    color: COLORS.error,
  },
  inputContainer: {
    height: 56,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  inputContainerError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    height: '100%',
    color: COLORS.text,
    ...TYPOGRAPHY.body,
    paddingVertical: 0,
  },
  toggleButton: {
    paddingVertical: SPACING.sm,
    paddingLeft: SPACING.sm,
  },
  toggleText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
});

export default CustomInput;
