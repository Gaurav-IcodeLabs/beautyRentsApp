import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, fontWeight } from '../../theme';
import { fontScale, widthScale } from '../../util';
import { AppImage } from '../AppImage/AppImage';
import {
  ensureCurrentUser,
  ensureUser,
  userAbbreviatedName,
} from '../../util/data';
import { cross } from '../../assets';
import { useSelector } from 'react-redux';

interface AvatarProps {
  style?: StyleProp<ViewStyle>;
  size?: number;
  user?: {};
}

export const Avatar = (props: AvatarProps) => {
  const { style = {}, size = widthScale(100), user } = props;
  const currentUser = useSelector(state => state.user.currentUser);
  const author = user || currentUser;

  // Normalize user
  const avatarUser =
    author?.type === 'currentUser'
      ? ensureCurrentUser(author)
      : ensureUser(author);

  const { banned, deleted } = avatarUser?.attributes || {};
  const isInactive = banned || deleted;

  const abbreviatedName = userAbbreviatedName(avatarUser, '');
  const hasProfileImage = Boolean(avatarUser?.profileImage?.id);
  const imageVariants = avatarUser?.profileImage?.attributes?.variants || {};
  const imageVariant =
    imageVariants['square-small2x']?.url ||
    imageVariants['listing-card']?.url ||
    imageVariants.default?.url ||
    '';

  return (
    <View
      style={[
        styles.avatarSection,
        { backgroundColor: colors.marketplaceColor, height: size, width: size },
        style,
      ]}
    >
      {isInactive ? (
        <AppImage source={cross} width={size} />
      ) : hasProfileImage ? (
        <AppImage source={{ uri: imageVariant }} width={size} />
      ) : (
        <Text style={styles.text}>{abbreviatedName} </Text>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  avatarSection: {
    borderRadius: widthScale(100),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.white,
    fontSize: fontScale(25),
    fontWeight: fontWeight.medium,
  },
});
