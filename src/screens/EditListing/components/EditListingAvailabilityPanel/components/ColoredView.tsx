import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import { widthScale } from '../../../../../util';
interface ColoredViewProps {
  color: any;
}

const ColoredView: FC<ColoredViewProps> = props => {
  const { color } = props;
  return <View style={[styles.viewStyle, { backgroundColor: color }]} />;
};

const styles = StyleSheet.create({
  viewStyle: {
    width: widthScale(8),
    height: widthScale(8),
    borderRadius: widthScale(20),
    marginHorizontal: widthScale(10),
  },
});
export default ColoredView;
