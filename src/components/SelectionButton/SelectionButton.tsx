import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'
import React from 'react'
import { widthScale } from '../../util'
import { AppColors } from '../../theme'
import { useColors } from '../../context'
import { lightenColor } from '../../util/data'

interface SelectionButtonProps {
  title: string
  onPress?: () => void
  isSelected: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  disabled?: boolean
}

export const SelectionButton = (props: SelectionButtonProps) => {
  const {
    title,
    onPress = () => {},
    isSelected,
    style,
    textStyle,
    disabled = false,
  } = props
  const colors: AppColors = useColors()
  const tanPercentColor = lightenColor(colors.marketplaceColor, 40)
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: isSelected
            ? colors.marketplaceColor
            : tanPercentColor,
        },
        style,
      ]}>
      <Text
        style={[
          styles.txt,
          { color: isSelected ? colors.white : colors.black },
          textStyle,
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: widthScale(12),
    paddingHorizontal: widthScale(12),
    paddingVertical: widthScale(8),
  },
  txt: {},
})
