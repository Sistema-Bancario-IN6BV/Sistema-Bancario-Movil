// src/shared/components/common/Input.jsx
import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { SPACING, RADIUS, FONT, FONT_SIZE } from '@/shared/constants/theme';
import { useColors } from '@/shared/theme/ThemeProvider';

export default function Input({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  editable = true,
  maxLength,
  multiline = false,
  leftIcon,
  helper,
}) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);

  const borderColor = error ? colors.error : focused ? colors.secondary : colors.border;

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          { borderColor },
          !editable && styles.readonly,
          multiline && styles.multiline,
        ]}
      >
        {leftIcon ? (
          <MaterialIcons name={leftIcon} size={18} color={colors.textLight} style={styles.leftIcon} />
        ) : null}
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          value={value != null ? String(value) : ''}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          maxLength={maxLength}
          multiline={multiline}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={8}>
            <MaterialIcons
              name={hidden ? 'visibility-off' : 'visibility'}
              size={20}
              color={colors.textLight}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : helper ? (
        <Text style={styles.helper}>{helper}</Text>
      ) : null}
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    wrapper: { marginBottom: SPACING.md },
    label: {
      fontFamily: FONT.bold,
      fontSize: FONT_SIZE.label,
      color: colors.textVariant,
      marginBottom: SPACING.xs + 2,
    },
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING.md,
      minHeight: 50,
    },
    multiline: { minHeight: 90, alignItems: 'flex-start', paddingVertical: SPACING.sm },
    readonly: { backgroundColor: colors.surfaceVariant },
    leftIcon: { marginRight: SPACING.sm },
    input: { flex: 1, fontFamily: FONT.regular, fontSize: FONT_SIZE.bodyLg, color: colors.text, paddingVertical: SPACING.sm },
    inputMultiline: { textAlignVertical: 'top' },
    error: { fontFamily: FONT.regular, fontSize: FONT_SIZE.label, color: colors.error, marginTop: SPACING.xs },
    helper: { fontFamily: FONT.regular, fontSize: FONT_SIZE.label, color: colors.textLight, marginTop: SPACING.xs },
  });
}
