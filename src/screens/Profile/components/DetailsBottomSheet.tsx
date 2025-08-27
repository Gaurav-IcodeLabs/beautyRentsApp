import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { RenderBackdrop } from '../../../components'
import { colors, fontWeight } from '../../../theme'
import {
  fontScale,
  SCHEMA_TYPE_MULTI_ENUM,
  SCHEMA_TYPE_TEXT,
  screenHeight,
  widthScale,
} from '../../../util'
import SectionDetailsMaybe from './SectionDetailsMaybe'
import SectionTextMaybe from './SectionTextMaybe'
import SectionMultiEnumMaybe from './SectionMultiEnumMaybe'
import { useTranslation } from 'react-i18next'

interface DetailsBottomSheetProps {
  sheetRef: any
  propsForCustomFields: any[]
  existingUserFields: any[]
}

export default function DetailsBottomSheet(props: DetailsBottomSheetProps) {
  const { sheetRef, propsForCustomFields, existingUserFields } = props
  const { t } = useTranslation()
  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={[screenHeight * 0.7]}
      enablePanDownToClose={false}
      backdropComponent={RenderBackdrop}
      backgroundStyle={styles.background}>
      <View style={styles.container}>
        <BottomSheetScrollView style={styles.scrollContaner}>
          <Text style={styles.textName}>{t('ProfilePage.detailsTitle')}</Text>
          <SectionDetailsMaybe existingUserFields={existingUserFields} />
          {propsForCustomFields?.map?.(customFieldProps => {
            const { schemaType, ...fieldProps } = customFieldProps
            return schemaType === SCHEMA_TYPE_TEXT ? (
              <SectionTextMaybe {...fieldProps} />
            ) : schemaType === SCHEMA_TYPE_MULTI_ENUM ? (
              <SectionMultiEnumMaybe {...fieldProps} />
            ) : null
          })}
        </BottomSheetScrollView>
      </View>
    </BottomSheetModal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: widthScale(20),
  },
  background: {
    backgroundColor: colors.white,
  },
  scrollContaner: {
    paddingHorizontal: widthScale(16),
  },
  textName: {
    fontSize: fontScale(18),
    color: colors.black,
    fontWeight: fontWeight.bold,
    marginBottom: widthScale(10),
  },
})
