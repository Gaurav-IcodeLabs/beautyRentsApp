import { zodResolver } from '@hookform/resolvers/zod';
// import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import {
  Button,
  CheckBox,
  CustomExtendedDataField,
  RenderDropdownField,
  RenderTextInputField,
} from '../../components';
import { useAppDispatch, useTypedSelector } from '../../sharetribeSetup';
import {
  resetAuthState,
  signUpErrorSelector,
  signUpInProgressSelector,
} from '../../slices/auth.slice';
import { colors } from '../../theme';
import {
  fontScale,
  getPropsForCustomUserFieldInputs,
  heightScale,
  widthScale,
} from '../../util';
import { getSchema, getSoleUserTypeMaybe } from './helper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const SignUpForm = (props: any) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  // const navigation = useNavigation();
  const signUpInProgress = useTypedSelector(signUpInProgressSelector);
  const signUpError = useTypedSelector(signUpErrorSelector);
  const { preselectedUserType, userTypes, userFields, handleSubmitSignup } =
    props;
  const [userType, setUserType] = useState(
    preselectedUserType || getSoleUserTypeMaybe(userTypes),
  );
  const noUserTypes = !userType && !(userTypes?.length > 0);
  const showDefaultUserFields = userType || noUserTypes;
  const userTypeConfig = userTypes.find(config => config.userType === userType);
  const userFieldProps = getPropsForCustomUserFieldInputs(
    userFields,
    t,
    userType,
  );
  const showCustomUserFields =
    (userType || noUserTypes) && userFieldProps?.length > 0;

  // is disabled display name
  const { displayInSignUp: displayNameDisplayInSignUp } =
    userTypeConfig?.displayNameSettings || {};
  const isDisabledDisplayName =
    userTypeConfig?.defaultUserFields?.displayName === false;
  const isDisplayNameAllowedInSignUp = displayNameDisplayInSignUp === true;
  const hideDisplayName =
    isDisabledDisplayName || !isDisplayNameAllowedInSignUp;

  // is disabled phone number
  const { displayInSignUp: phoneNumberDisplayInSignUp } =
    userTypeConfig?.phoneNumberSettings || {};
  const isDisabledPhoneNumber =
    userTypeConfig?.defaultUserFields?.phoneNumber === false;
  const isPhoneNumberAllowedInSignUp = phoneNumberDisplayInSignUp === true;
  const hidePhoneNumber =
    isDisabledPhoneNumber || !isPhoneNumberAllowedInSignUp;
  const isShowUserTypes = userTypes?.length > 1 && !preselectedUserType;

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
      fname: '',
      lname: '',
      password: '',
      displayName: '',
      phoneNumber: '',
      terms: false,
    },
    resolver: zodResolver(
      getSchema(userTypeConfig, userType, userFieldProps, t),
    ),
    mode: 'onChange',
  });

  const handleTermsPress = () => {
    // navigation.navigate('TermsScreen');
  };

  const handlePrivacyPress = () => {
    // navigation.navigate('PrivacyScreen');
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        style={styles.formScrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <RenderDropdownField
          control={control}
          name={'userType'}
          labelField="label"
          valueField="userType"
          data={userTypes}
          placeholderKey={'FieldSelectUserType.placeholder'}
          lableKey={'FieldSelectUserType.label'}
          disabled={!isShowUserTypes}
          onDropDownValueChange={(value, cb) => {
            setUserType(value.userType);
            cb(value?.userType);
          }}
        />

        {showDefaultUserFields ? (
          <View>
            <View style={styles.nameSection}>
              <RenderTextInputField
                control={control}
                name={'fname'}
                labelKey={'SignupForm.firstNameLabel'}
                placeholderKey={'SignupForm.firstNamePlaceholder'}
                style={styles.input}
              />
              <RenderTextInputField
                control={control}
                name={'lname'}
                labelKey={'SignupForm.lastNameLabel'}
                placeholderKey={'SignupForm.lastNamePlaceholder'}
                style={styles.input}
              />
            </View>
            <RenderTextInputField
              control={control}
              name={'email'}
              type="email-address"
              labelKey={'SignupForm.emailLabel'}
              placeholderKey={'SignupForm.emailPlaceholder'}
              onChangeText={(value, onChange) => {
                onChange(value.toLowerCase());
                if (signUpError) dispatch(resetAuthState());
              }}
            />

            <RenderTextInputField
              control={control}
              name={'displayName'}
              labelKey={'SignupForm.displayNameLabel'}
              placeholderKey={'SignupForm.displayNamePlaceholder'}
              disabled={hideDisplayName}
            />
            <RenderTextInputField
              control={control}
              name={'password'}
              labelKey={'SignupForm.passwordLabel'}
              placeholderKey={'SignupForm.passwordPlaceholder'}
            />
            <RenderTextInputField
              type={'numeric'}
              control={control}
              name={'phoneNumber'}
              labelKey={'SignupForm.phoneNumberLabel'}
              placeholderKey={'SignupForm.phoneNumberPlaceholder'}
              disabled={hidePhoneNumber}
            />
          </View>
        ) : null}

        {!!showCustomUserFields && (
          <>
            {userFieldProps.map((fieldProps: any, index: number) => (
              <CustomExtendedDataField
                key={index}
                {...fieldProps}
                control={control}
                t={t}
                key={index}
              />
            ))}
          </>
        )}

        <Controller
          control={control}
          name={'terms'}
          render={({ field: { value, onChange }, formState: { errors } }) => (
            <>
              <View style={styles.termsSection}>
                <CheckBox onPress={() => onChange(!value)} checked={value} />

                <Text style={styles.text}>
                  {t('AuthenticationPage.termsAndConditionsAcceptText', {
                    termsLink: (
                      <Text
                        key={'1'}
                        style={styles.linkText}
                        onPress={handleTermsPress}
                      >
                        {t(
                          'AuthenticationPage.termsAndConditionsTermsLinkText',
                        )}
                      </Text>
                    ),
                    privacyLink: (
                      <Text
                        key={'2'}
                        style={styles.linkText}
                        onPress={handlePrivacyPress}
                      >
                        {t(
                          'AuthenticationPage.termsAndConditionsPrivacyLinkText',
                        )}
                      </Text>
                    ),
                  })}
                </Text>
              </View>
              <View style={{ marginTop: widthScale(10) }}>
                {errors.terms ? (
                  <Text style={{ color: colors.error }}>
                    {errors.terms.message}
                  </Text>
                ) : null}
              </View>
            </>
          )}
        />

        {signUpError && signUpError?.message.includes('409') && (
          <Text style={styles.errorText}>
            {t('AuthenticationPage.signupFailedEmailAlreadyTaken')}
          </Text>
        )}
        <Button
          onPress={handleSubmit(handleSubmitSignup)}
          disabled={!isValid || isSubmitting}
          style={styles.button}
          text={t('SignupForm.signUp')}
          loaderColor={colors.white}
          loading={signUpInProgress}
        />
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formScrollContainer: {
    paddingVertical: heightScale(20),
    paddingHorizontal: widthScale(20),
  },
  button: {
    marginTop: widthScale(50),
    // marginTop: 'auto',
    // marginBottom: widthScale(40),
    // marginHorizontal: widthScale(20),
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
  },
  nameSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  input: {
    width: '48%',
  },
  termsSection: {
    flexDirection: 'row',
  },
  text: {
    marginLeft: widthScale(10),
    color: colors.grey,
    fontSize: fontScale(14),
  },
  linkText: {
    color: colors.marketplaceColor,
    textDecorationLine: 'underline',
    fontSize: fontScale(14),
  },
});

export default SignUpForm;
