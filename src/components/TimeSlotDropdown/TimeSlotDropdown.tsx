import { StyleSheet, Text, View, ViewStyle } from 'react-native'
import React, { useState } from 'react'
import { Dropdown } from 'react-native-element-dropdown'
import {
  commonShadow,
  fontScale,
  heightScale,
  screenWidth,
  widthScale,
} from '../../util'
import { colors, fontWeight } from '../../theme'
import { useColors } from '../../context'
import { useTranslation } from 'react-i18next'

interface TimeSlotDropdownProps {
  data: any[]
  onValueChange: (value: string) => void
  isModal: boolean
  lableKey: string
  containerStyle?: ViewStyle
  value: string
}

const DropdownItem = ({ item }) => {
  return (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item?.label}</Text>
    </View>
  )
}

export const TimeSlotDropdown = (props: TimeSlotDropdownProps) => {
  const {
    data = [],
    onValueChange,
    value,
    isModal = true,
    containerStyle,
    lableKey,
  } = props
  const { t } = useTranslation()

  const [isFocus, setIsFocus] = useState(false)
  const colors = useColors()

  const doHandleValueChange = item => {
    onValueChange(item)
  }
  return (
    <View style={[styles.container, containerStyle]}>
      {lableKey ? <Text style={styles.label}>{t(lableKey)}</Text> : null}
      <Dropdown
        style={[
          styles.dropdown,
          isFocus && { borderColor: colors.marketplaceColorLight },
        ]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        containerStyle={styles.containerStyle}
        showsVerticalScrollIndicator={false}
        data={data}
        mode={isModal ? 'modal' : undefined}
        labelField="label"
        valueField="option"
        placeholder={'Select'}
        renderItem={item => <DropdownItem item={item} />}
        value={value}
        onChange={item => {
          doHandleValueChange(item)
        }}
      />
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    marginBottom: widthScale(16),
  },
  dropdown: {
    borderWidth: 1,
    height: heightScale(52),
    borderRadius: widthScale(10),
    paddingHorizontal: widthScale(10),
    backgroundColor: colors.lightGrey,
    borderColor: colors.transparent,
    ...commonShadow,
  },

  placeholderStyle: {
    fontSize: fontScale(14),
  },
  selectedTextStyle: {
    fontSize: fontScale(14),
  },
  iconStyle: {
    width: widthScale(20),
    height: heightScale(20),
  },

  label: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.medium,
    marginBottom: widthScale(10),
    color: colors.grey,
  },
  containerStyle: {
    borderRadius: widthScale(10),
    marginTop: widthScale(5),
    overflow: 'hidden',
  },
  itemText: {
    fontSize: fontScale(14),
    color: colors.black,
  },
  item: {
    padding: widthScale(10),
    borderRadius: widthScale(10),
  },
})
