import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { Button } from '../../../components'
import { colors, fontWeight } from '../../../theme'
import { fontScale, widthScale } from '../../../util'

interface ProfileBottomContentHeaderProps {
  tabsData: any
  selectedTab: string
  setSelectedTab: (tab: string) => void
}

export default function ProfileBottomContentHeader(
  props: ProfileBottomContentHeaderProps,
) {
  const { tabsData = [] } = props
  return (
    <View style={styles.container}>
      {tabsData.map((item, index) => {
        const isSelected = item.label === props.selectedTab
        return (
          <Button
            onPress={() => props.setSelectedTab(item.label)}
            key={index}
            style={[
              styles.tabContainer,
              !isSelected && {
                backgroundColor: colors.itemBGGrey,
                borderColor: colors.transparent,
              },
            ]}
            textStyle={[styles.text, !isSelected && { color: colors.black }]}
            text={item.label}
          />
        )
      })}
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    marginVertical: widthScale(20),
    flexDirection: 'row',
    gap: widthScale(20),
  },
  tabContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.semiBold,
  },
})
