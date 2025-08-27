import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConfiguration } from '../../context';
import { widthScale } from '../../util';
import { useAppDispatch } from '../../sharetribeSetup';
import { signup } from '../../slices/auth.slice';
import { pickUserFieldsData } from '../../util';
import SignUpForm from './SignUpForm';
import SignUpHeader from './components/SignUpHeader';
import { getNonUserFieldParams } from './helper';
import { SignupScreenProps } from '../../appTypes';
import { colors } from '../../theme';

interface SubmitValues {
  fname: string;
  lname: string;
  email: string;
  displayName: string;
  password: string;
  userType: string;
}

export const SignUp: FC<SignupScreenProps> = ({ navigation }) => {
  const config = useConfiguration();
  const dispatch = useAppDispatch();
  // const { top } = useSafeAreaInsets();
  // const { navigation } = prop
  const { userFields, userTypes = [] } = config.user;
  const userType = null; //need to check when it gets value
  const preselectedUserType =
    userTypes.find(
      (conf: { userType: null | string }) => conf.userType === userType,
    )?.userType || null;

  const handleSubmitSignup = async (values: SubmitValues) => {
    const { userType, email, password, fname, lname, displayName, ...rest } =
      values;
    const displayNameMaybe = displayName
      ? { displayName: displayName.trim() }
      : {};

    const params = {
      email,
      password,
      firstName: fname.trim(),
      lastName: lname.trim(),
      ...displayNameMaybe,
      publicData: {
        userType,
        ...pickUserFieldsData(rest, 'public', userType, userFields),
      },
      privateData: {
        ...pickUserFieldsData(rest, 'private', userType, userFields),
      },
      protectedData: {
        ...pickUserFieldsData(rest, 'protected', userType, userFields),
        ...getNonUserFieldParams(rest, userFields),
      },
    };
    const res = await dispatch(signup(params)).unwrap();
    if (res?.id.uuid) {
      navigation.navigate('Main');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <SignUpHeader />
      <View style={Styles.formContainer}>
        <SignUpForm
          userFields={userFields}
          userTypes={userTypes}
          preselectedUserType={preselectedUserType}
          handleSubmitSignup={handleSubmitSignup}
        />
      </View>
    </View>
  );
};

//TODO: need to decide
const Styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    // marginTop: widthScale(20),
  },
});
