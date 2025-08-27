import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { fontScale, heightScale, screenHeight, widthScale } from '../../../util'
import { colors, fontWeight } from '../../../theme'
import { CheckBox, RenderBackdrop } from '../../../components'
import { ListingSortKeys } from '../../../appTypes'
import { store, useAppDispatch } from '../../../sharetribeSetup'
import { searchListings, searchParamsSelector } from '../Search.slice'
import { useConfiguration } from '../../../context'

interface BottomSheetSortProps {
  sheetRef: any
  t: any
  sortData?: sortData[]
  activeSort: string | null
  setActiveSort: (value: string | null) => void
}
interface sortData {
  key: string | number
  labelTranslationKey: string | number
}
const BottomSheetSort = (props: BottomSheetSortProps) => {
  const { sheetRef, t, sortData = [], activeSort, setActiveSort } = props
  const dispatch = useAppDispatch()
  const config = useConfiguration()
  const handleOnPress = (item: any) => {
    const searchParams = searchParamsSelector(store.getState())
    dispatch(
      searchListings({
        searchParams: {
          ...searchParams,
          page: 1,
          sort: item.key,
        },
        config,
      }),
    )
    sheetRef.current?.dismiss()
    setActiveSort(item.labelTranslationKey)
  }

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={[screenHeight * 0.5]}
      enablePanDownToClose={false}
      backdropComponent={RenderBackdrop}
      backgroundStyle={styles.background}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headingText}>{t('SortBy.heading')}</Text>
        </View>
        <View style={styles.valuesContainer}>
          {sortData?.map?.((item, index) => {
            const isLastItem = index === sortData.length - 1
            const isSelected = activeSort === item.labelTranslationKey
            const disabled = ListingSortKeys.RELEVANCE === item.key

            return (
              <View
                key={index}
                style={[
                  styles.itemContainer,
                  {
                    borderBottomWidth: isLastItem
                      ? widthScale(0)
                      : widthScale(1),
                  },
                  disabled && { opacity: 0.5 },
                ]}>
                <CheckBox
                  checked={isSelected}
                  onPress={() => handleOnPress(item)}
                  style={styles.checkbox}
                  disabled={disabled}
                />

                <TouchableOpacity
                  activeOpacity={0.5}
                  style={[styles.values]}
                  onPress={() => handleOnPress(item)}
                  disabled={disabled}>
                  <Text
                    style={[
                      styles.sortText,
                      isSelected && styles.selectedText,
                    ]}>
                    {t(item.labelTranslationKey)}
                  </Text>
                </TouchableOpacity>
              </View>
            )
          })}
        </View>
      </View>
    </BottomSheetModal>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: widthScale(20),
    paddingVertical: heightScale(15),
    borderBottomWidth: widthScale(2),
    borderBottomColor: colors.frostedGrey,
  },
  headingText: {
    color: colors.black,
    fontSize: fontScale(18),
  },
  valuesContainer: {
    paddingHorizontal: widthScale(20),
  },
  values: {
    paddingVertical: heightScale(20),
  },
  itemContainer: {
    borderBottomColor: colors.frostedGrey,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    fontSize: fontScale(16),
    fontWeight: fontWeight.normal,
  },
  selectedText: {
    fontWeight: fontWeight.semiBold,
  },
  checkbox: {
    marginRight: widthScale(10),
  },
})
export default BottomSheetSort
