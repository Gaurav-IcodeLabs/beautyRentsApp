import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, View } from 'react-native'
import { ScreenHeader } from '../../components'
import { widthScale } from '../../util'
import ProfileImage from './components/ProfileImage'
import ProfileSettingForm from './ProfileSettingForm'

export const ProfileSettings = () => {
  const { t } = useTranslation()

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('ProfileSettingsPage.title')} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}>
        <ProfileSettingForm />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: widthScale(80),
  },
})
