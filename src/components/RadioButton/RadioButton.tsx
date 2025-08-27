import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useColors } from '../../context'
import { widthScale } from '../../util'
import { RadioButtonProps } from '../../appTypes'
import { AppColors } from '../../theme'

const RadioButton = (props: RadioButtonProps) => {
  const { isActive, onPress, size } = props
  const colors: AppColors = useColors()
  return (
    <TouchableOpacity
      style={[
        Styles.container,
        { width: size, height: size, borderColor: colors.marketplaceColor },
      ]}
      onPress={onPress}>
      {isActive && (
        <View
          style={[
            Styles.innerContainer,
            { backgroundColor: colors.marketplaceColorDark },
          ]}
        />
      )}
    </TouchableOpacity>
  )
}

const Styles = StyleSheet.create({
  container: {
    borderWidth: widthScale(2),
    borderRadius: widthScale(100),
    padding: widthScale(2),
  },
  innerContainer: {
    flex: 1,
    borderRadius: widthScale(100),
  },
})
export default RadioButton
