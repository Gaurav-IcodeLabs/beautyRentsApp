import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { checkSelected } from '../../../util'
import { widthScale } from '../../../util'
import { SelectionButton } from '../../../components'

interface PropertyGroupProps {
  options?: any
  id?: string
  selectedOptions?: any
  showUnselectedOptions?: boolean
}

const Item = (props: any) => {
  const { label, isSelected } = props
  return (
    <View style={[styles.item, !isSelected && { opacity: 0.5 }]}>
      <Text
        style={{ textDecorationLine: isSelected ? 'none' : 'line-through' }}>
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
        <SelectionButton
          key={option.label}
          isSelected={option.isSelected}
          title={option.label}
          disabled
          style={styles.btn}
        />
      ))}
    </View>
  )
}

export default PropertyGroup

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'wrap' },
  item: {
    marginRight: widthScale(10),
    marginBottom: widthScale(10),
    paddingVertical: widthScale(5),
    paddingHorizontal: widthScale(12),
    borderWidth: 1,
    borderRadius: widthScale(10),
    textAlign: 'center',
    backgroundColor: 'white',
  },
  btn: {
    marginRight: widthScale(10),
    marginBottom: widthScale(10),
  },
})
