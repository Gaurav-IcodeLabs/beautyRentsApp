import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { CmsCTAProps, CmsFieldTypes } from '../../appTypes';
import { fontWeight } from '../../theme';
import { widthScale } from '../../util';
import { Button } from '../Button/Button';
import { useNavigation } from '@react-navigation/native';

export const CmsCTA = (props: CmsCTAProps) => {
  const { content, fieldType, href } = props;
  const navigation = useNavigation();

  // if (!content) {
  //   return null;
  // }

  const onPress = () => {
    if (fieldType === CmsFieldTypes.INTERNAL_BUTTON_LINK) {
      if (href === '/l/new') {
        navigation.navigate('EditListing');
      } else if (href === '/s') {
        navigation.navigate('Search');
      }
    } else {
      // Linking.openURL(href);
    }
  };

  return (
    <View style={styles.container}>
      {fieldType === 'search' ? (
        <Button
          style={styles.button}
          text={'Search'}
          textStyle={styles.txt}
          onPress={() => navigation.navigate('Search')}
        />
      ) : !content ? null : (
        <Button
          style={styles.button}
          text={content}
          textStyle={styles.txt}
          onPress={onPress}
        />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    width: 'auto',
    height: widthScale(40),
    minWidth: widthScale(100),
    alignItems: 'center',
    borderWidth: 0,
    paddingHorizontal: widthScale(20),
    paddingVertical: widthScale(8),
    // ...commonShadow,
  },
  txt: {
    fontSize: widthScale(14),
    fontWeight: fontWeight.medium,
  },
});
