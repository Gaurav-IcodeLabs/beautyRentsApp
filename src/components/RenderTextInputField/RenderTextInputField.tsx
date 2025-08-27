import React, { useState } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
  Image,
} from 'react-native';
import { eyeClose, eyeOpen } from '../../assets';
import { colors, fontWeight } from '../../theme';
import { commonShadow, fontScale, widthScale } from '../../util';

interface RenderTextInputFieldProps {
  control: any;
  name: string | undefined;
  labelKey?: string | undefined;
  placeholderKey: string;
  disabled?: boolean;
  type?: KeyboardTypeOptions | undefined;
  multiline?: boolean;
  onChangeText?: (value: string, cb: (value: any) => void) => void;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters' | undefined;
  maxHeight?: number;
  isPassword?: boolean;
  style?: ViewStyle;
  rules?: any;
  onPress?: () => void;
  editable?: boolean;
  autoFocus?: boolean;
}

export const RenderTextInputField = (props: RenderTextInputFieldProps) => {
  const {
    control,
    name,
    labelKey,
    placeholderKey,
    disabled = false,
    type = 'default',
    multiline = false,
    onChangeText,
    autoCapitalize,
    maxHeight,
    isPassword = false,
    style = {},
    rules,
    editable = true,
    onPress = () => {},
    autoFocus = false,
  } = props;
  const { t } = useTranslation();
  // const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (disabled) {
    return null;
  }

  return (
    <Controller
      control={control}
      rules={rules || {}}
      name={name}
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => (
        <View style={[Styles.container, style]}>
          {labelKey ? <Text style={Styles.text}>{t(labelKey)}</Text> : null}
          <View
            style={[
              Styles.inputContainer,
              isPassword && { paddingRight: widthScale(16) },
            ]}
          >
            <TextInput
              editable={editable}
              multiline={multiline}
              keyboardType={type}
              placeholder={t(placeholderKey)}
              style={[
                Styles.input,
                multiline && {
                  maxHeight: maxHeight || widthScale(200),
                },
              ]}
              placeholderTextColor={colors.grey}
              value={value}
              onChangeText={text =>
                onChangeText?.(text, onChange) || onChange(text)
              }
              // onFocus={() => setIsFocused(true)}
              onBlur={() => {
                onBlur();
                // setIsFocused(false);
              }}
              autoCapitalize={autoCapitalize}
              secureTextEntry={isPassword && !showPassword}
              onPress={onPress}
              autoFocus={autoFocus}
            />
            {isPassword ? (
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Image
                  tintColor={colors.grey}
                  source={showPassword ? eyeOpen : eyeClose}
                  style={Styles.icon}
                />
              </TouchableOpacity>
            ) : null}
          </View>
          {error && <Text style={Styles.errorText}>{error?.message}</Text>}
        </View>
      )}
    />
  );
};

const Styles = StyleSheet.create({
  container: {
    marginBottom: widthScale(16),
  },
  text: {
    marginBottom: widthScale(10),
    fontWeight: fontWeight.medium,
    fontSize: fontScale(14),
    color: colors.black,
  },
  input: {
    paddingVertical: widthScale(17),
    paddingHorizontal: widthScale(16),
    marginRight: widthScale(10),
    flex: 1,
    fontSize: fontScale(14),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.lightGrey,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderRadius: widthScale(12),
  },
  errorText: {
    fontSize: fontScale(12),
    marginTop: widthScale(5),
    color: colors.error,
  },
  icon: {
    width: widthScale(20),
    height: widthScale(20),
  },
});
