import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import React from 'react';
import { tabLabelAndSubmit } from '../../helper';
import { useTranslation } from 'react-i18next';
import { fontScale, widthScale } from '../../../../util';
import { colors, fontWeight } from '../../../../theme';
import { store } from '../../../../sharetribeSetup';
import {
  createListingDraftInProgressSelector,
  publishDraftInProgressSelector,
  updateInProgressSelector,
} from '../../EditListing.slice';

interface HeaderTabsProps {
  tabs: string[];
  onTabChange: (inProgress: boolean, index: number) => void;
  selectedTab: string;
  isNewListingFlow: boolean;
  isPriceDisabled: boolean;
  processName: string;
}

const HeaderTabs = (props: HeaderTabsProps) => {
  const {
    tabs = [],
    onTabChange,
    selectedTab,
    isNewListingFlow,
    isPriceDisabled,
    processName,
  } = props;

  const { t } = useTranslation();
  // const colors: AppColors = useColors();

  const handlePresstab = (index: number) => {
    const state = store.getState();
    const createListingDraftInProgress =
      createListingDraftInProgressSelector(state);
    const updateInProgress = updateInProgressSelector(state);
    const publishDraftInProgress = publishDraftInProgressSelector(state);
    const inProgress =
      createListingDraftInProgress ||
      updateInProgress ||
      publishDraftInProgress;

    if (!inProgress) {
      onTabChange(false, index);
    }
  };

  return (
    <View style={styles.tabContainer}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        horizontal
        contentContainerStyle={styles.scrollStyles}
        bounces={false}
      >
        {tabs.map((tab: string, index: number) => {
          const tabTranslations = tabLabelAndSubmit(
            t,
            tab,
            isNewListingFlow,
            isPriceDisabled,
            processName,
          );

          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                selectedTab === tab && styles.activeTabStyles,
              ]}
              onPress={() => handlePresstab(index)}
            >
              <Text
                style={[
                  styles.tabTxt,
                  selectedTab === tab && {
                    color: colors.marketplaceColor,
                    fontSize: fontScale(14),
                    fontWeight: fontWeight.semiBold,
                  },
                ]}
              >
                {tabTranslations.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default HeaderTabs;
const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    height: widthScale(40),
    // paddingVertical: widthScale(12),
    marginTop: widthScale(20),
    marginHorizontal: widthScale(20),
    // marginBottom: widthScale(20),

    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  tab: {
    paddingVertical: widthScale(5),
    paddingHorizontal: widthScale(12),
    marginRight: widthScale(10),
    justifyContent: 'center',
  },
  activeTabStyles: {
    borderBottomColor: colors.marketplaceColor,
    borderBottomWidth: 2,
    overflow: 'hidden',
    zIndex: 1,
  },
  tabTxt: {
    fontSize: fontScale(14),
    fontWeight: fontWeight.normal,
  },
  scrollStyles: {
    paddingStart: widthScale(20),
    paddingEnd: widthScale(20),
  },
});
