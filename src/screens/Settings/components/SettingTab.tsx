import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ImageSourcePropType,
} from 'react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { fontScale, widthScale } from '../../../util';
import { colors, fontWeight } from '../../../theme';

interface SettingTabProps {
  lable: string;
  screen: string | null;
  loader: boolean;
  onTabPress: () => void;
  icon: ImageSourcePropType;
}

const SettingTab: React.FC<SettingTabProps> = ({
  lable,
  loader,
  onTabPress,
  icon,
}) => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity onPress={onTabPress} style={styles.container}>
      {loader ? (
        <ActivityIndicator color={colors.error} />
      ) : (
        // <View style={styles.btnSection}>
        <View style={styles.iconSection}>
          <Image
            tintColor={colors.marketplaceColor}
            resizeMode="contain"
            style={styles.icon}
            source={icon}
          />
          <Text style={styles.text}>{t(lable)}</Text>
        </View>
        // </View>
      )}
    </TouchableOpacity>
  );
};

export default SettingTab;

const styles = StyleSheet.create({
  container: {
    height: widthScale(52),
    paddingRight: widthScale(15),
    marginTop: widthScale(10),
    justifyContent: 'center',
    marginHorizontal: widthScale(20),
    borderColor: colors.frostedGrey,
  },
  // btnSection: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  // },
  iconSection: {
    flexDirection: 'row',
    gap: widthScale(10),
    alignItems: 'center',
  },
  text: {
    fontSize: fontScale(16),
    fontWeight: fontWeight.semiBold,
    color: colors.black,
    lineHeight: widthScale(24),
  },
  icon: {
    height: widthScale(24),
    width: widthScale(24),
  },
});
