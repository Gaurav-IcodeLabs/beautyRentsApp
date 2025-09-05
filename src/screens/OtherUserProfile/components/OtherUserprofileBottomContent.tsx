import { StyleSheet, View } from 'react-native';
import React from 'react';
import OtherUserProfileProductsTab from './OtherUserProfileProductsTab';
import OtherUserProfileReviewsTab from './OtherUserProfileReviewsTab';
import OtherUserProfileBottomContentHeader from './OtherUserProfileBottomContentHeader';
import { widthScale } from '../../../util';

const OtherUserprofileBottomContent = (props: any) => {
  const { selectedTab, setSelectedTab, tabsData, userId } = props;
  return (
    <View style={styles.container}>
      <OtherUserProfileBottomContentHeader
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        tabsData={tabsData}
      />
      {selectedTab === tabsData[0].label ? (
        <OtherUserProfileProductsTab userId={userId} />
      ) : (
        <OtherUserProfileReviewsTab userId={userId} />
      )}
    </View>
  );
};

export default OtherUserprofileBottomContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: widthScale(20),
  },
});
