import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { CheckBox } from '../../../components'
import { fontWeight } from '../../../theme'
import { fontScale, SCHEMA_TYPE_LONG, widthScale } from '../../../util'

interface SectionListItemProps {
  item: any
  selectedFilters: any
  handleMultipleSelect: any
}

const SectionListItem = (props: SectionListItemProps) => {
  const { item, selectedFilters, handleMultipleSelect } = props
  if (item.schemaType === SCHEMA_TYPE_LONG) {
    return null
  } else {
    // enum or multi-enum
    return (
      <View>
        {item.enumOptions.map(enumOption => {
          const isSelected = selectedFilters[item.key]?.includes(
            enumOption.option,
          )
          return (
            <View
              key={enumOption.option}
              style={[
                styles.optionButton,
                isSelected && styles.selectedCategoryText,
              ]}>
              <CheckBox
                style={styles.checkBox}
                checked={isSelected}
                onPress={() =>
                  handleMultipleSelect(
                    item.schemaType,
                    item.key,
                    enumOption.option,
                  )
                }
              />
              <TouchableOpacity
                onPress={() =>
                  handleMultipleSelect(
                    item.schemaType,
                    item.key,
                    enumOption.option,
                  )
                }>
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.selectedCategoryText,
                  ]}>
                  {enumOption.label}
                </Text>
              </TouchableOpacity>
            </View>
          )
        })}
      </View>
    )
  }
}

export default SectionListItem

const styles = StyleSheet.create({
  optionButton: {
    flexDirection: 'row',
    marginBottom: widthScale(16),
  },
  optionText: {
    fontSize: fontScale(16),
  },
  selectedCategoryText: {
    fontSize: fontScale(16),
    fontWeight: fontWeight.medium,
  },
  checkBox: {
    marginRight: widthScale(10),
  },
})
