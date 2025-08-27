import React from 'react'
import { StyleSheet, View } from 'react-native'
import ProfileBottomContentHeader from './ProfileBottomContentHeader'
import ProfileProductsTab from './ProfileProductsTab'
import ProfileReviewTab from './ProfileReviewTab'

interface ProfileBottomContentProps {
  selectedTab: string
  setSelectedTab: (selectedTab: string) => void
  tabsData: any
}

const ProfileBottomContent = (props: ProfileBottomContentProps) => {
  const { selectedTab, setSelectedTab, tabsData } = props
  return (
    <View style={styles.container}>
      <ProfileBottomContentHeader
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        tabsData={tabsData}
      />
      {selectedTab === tabsData[0].label ? (
        <ProfileProductsTab />
      ) : (
        <ProfileReviewTab />
      )}
    </View>
  )
}

export default ProfileBottomContent

const styles = StyleSheet.create({
  container: {},
})
