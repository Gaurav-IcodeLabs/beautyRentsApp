import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { UserProfile } from '../../appTypes';
import {
  CustomExtendedDataField,
  RenderTextInputField,
} from '../../components';
import { useConfiguration } from '../../context';
import { useTypedSelector } from '../../sharetribeSetup';
import {
  currentUserProfileImageSelector,
  currentUserProfileSelector,
  currentUserTypeSelector,
} from '../../slices/user.slice';
import { colors, fontWeight } from '../../theme';
import {
  fontScale,
  getPropsForCustomUserFieldInputs,
  widthScale,
} from '../../util';
import ProfileSettingSubmitButton from './components/ProfileSettingSubmitButton';
import { getSchema, initialValuesForUserFields } from './helpers';
import ProfileImage from './components/ProfileImage';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const ProfileSettingForm = () => {
  const config = useConfiguration();
  const { t } = useTranslation();
  const { userFields, userTypes = [] } = config.user;
  const profile: UserProfile =
    useTypedSelector(currentUserProfileSelector) || {};
  const profileImage = useTypedSelector(currentUserProfileImageSelector);
  const {
    abbreviatedName,
    bio,
    displayName,
    firstName,
    lastName,
    privateData,
    protectedData,
    publicData,
  } = profile || {};
  const userType = useTypedSelector(currentUserTypeSelector);
  const userTypeConfig = userTypes.find(config => config.userType === userType);
  const isDisplayNameIncluded =
    userTypeConfig?.defaultUserFields?.displayName !== false;
  const displayNameMaybe =
    isDisplayNameIncluded && displayName ? { displayName } : {};
  const noUserTypes = !userType && !(userTypes?.length > 0);
  const showDefaultUserFields = userType || noUserTypes;
  const userFieldProps = getPropsForCustomUserFieldInputs(
    userFields,
    t,
    userType,
  );
  const showCustomUserFields =
    (userType || noUserTypes) && userFieldProps?.length > 0;
  const isDiplayNameShow =
    userTypeConfig?.defaultUserFields?.displayName === true;

  let initialValues = {
    image: profileImage,
    firstName,
    lastName,
    ...displayNameMaybe,
    bio: bio || '',
    abbreviatedName,
    ...initialValuesForUserFields(publicData, 'public', userType, userFields),
    ...initialValuesForUserFields(
      protectedData,
      'protected',
      userType,
      userFields,
    ),
    ...initialValuesForUserFields(privateData, 'private', userType, userFields),
  };

  const {
    control,
    handleSubmit,
    formState: { isValid },
    setValue,
    getValues,
  } = useForm({
    defaultValues: initialValues,
    mode: 'onChange',
    resolver: zodResolver(
      getSchema(userTypeConfig, userType, userFieldProps, t),
    ),
  });

  return (
    <View style={styles.container}>
      <ProfileImage control={control} setValue={setValue} />
      {showDefaultUserFields && (
        <>
          <View style={styles.topNameFields}>
            <RenderTextInputField
              labelKey="ProfileSettingsForm.firstNameLabel"
              name="firstName"
              control={control}
              placeholderKey="ProfileSettingsForm.firstNamePlaceholder"
              style={styles.input}
            />
            <RenderTextInputField
              labelKey="ProfileSettingsForm.lastNameLabel"
              name="lastName"
              control={control}
              placeholderKey="ProfileSettingsForm.lastNamePlaceholder"
              style={styles.input}
            />
          </View>

          {isDiplayNameShow && (
            <Text style={styles.displayNameInfo}>
              {t('ProfileSettingsForm.displayNameInfo')}
            </Text>
          )}
          <RenderTextInputField
            labelKey="ProfileSettingsForm.displayNameHeading"
            name="displayName"
            control={control}
            placeholderKey="ProfileSettingsForm.displayNamePlaceholder"
            disabled={!isDiplayNameShow}
          />
          <RenderTextInputField
            name="bio"
            labelKey="ProfileSettingsForm.bioLabel"
            control={control}
            placeholderKey="ProfileSettingsForm.bioPlaceholder"
            maxHeight={widthScale(150)}
            multiline
          />
          {!!showCustomUserFields && (
            <>
              {userFieldProps.map((fieldProps, index) => (
                <CustomExtendedDataField
                  {...fieldProps}
                  control={control}
                  t={t}
                />
              ))}
            </>
          )}
        </>
      )}

      <ProfileSettingSubmitButton
        userFields={userFields}
        userType={userType}
        initialValues={initialValues}
        control={control}
        handleSubmit={handleSubmit}
        isValid={isValid}
        getValues={getValues}
      />
    </View>
  );
};

export default ProfileSettingForm;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: widthScale(16),
  },
  input: {
    flex: 1,
  },
  topNameFields: {
    flexDirection: 'row',
    gap: widthScale(20),
  },
  displayNameInfo: {
    marginBottom: widthScale(10),
    fontWeight: fontWeight.medium,
    fontSize: fontScale(14),
    color: colors.grey,
  },
});
