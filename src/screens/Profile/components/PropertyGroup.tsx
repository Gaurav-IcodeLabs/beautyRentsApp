import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { checkSelected } from '../../../util'
import { widthScale } from '../../../util'
import { useColors } from '../../../context'
import { AppColors } from '../../../theme'

interface PropertyGroupProps {
  options?: any
  id?: string
  selectedOptions?: any
  showUnselectedOptions?: boolean
}

const Item = (props: any) => {
  const { label, isSelected } = props
  const colors: AppColors = useColors()
  return (
    <View
      style={[
        styles.item,
        isSelected && { backgroundColor: colors.marketplaceColor },
      ]}>
      {!isSelected && (
        <View
          style={[
            styles.unselectedItem,
            { opacity: 0.1, backgroundColor: colors.marketplaceColor },
          ]}
        />
      )}
      <Text
        style={[
          styles.text,
          { textDecorationLine: isSelected ? 'none' : 'line-through' },
        ]}>
        {label}
      </Text>
    </View>
  )
}

const PropertyGroup = (props: PropertyGroupProps) => {
  const { options, selectedOptions, id, showUnselectedOptions } = props
  const checked = showUnselectedOptions
    ? checkSelected(options, selectedOptions)
    : checkSelected(options, selectedOptions).filter(o => o.isSelected)

  return (
    <View style={styles.container}>
      {[...checked].map((option: any) => (
        <Item
          key={`${id}.${option.key}`}
          label={option.label}
          isSelected={option.isSelected}
        />
      ))}
    </View>
  )
}

export default PropertyGroup

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: widthScale(10),
  },
  item: {
    marginRight: widthScale(10),
    marginBottom: widthScale(10),
    borderRadius: widthScale(10),
    textAlign: 'center',
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  text: {
    marginVertical: widthScale(5),
    marginHorizontal: widthScale(12),
  },

  unselectedItem: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    width: '100%',
  },
})
