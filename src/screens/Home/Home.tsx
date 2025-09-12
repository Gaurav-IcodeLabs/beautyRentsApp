/* eslint-disable react/no-unstable-nested-components */
import {FlashList} from '@shopify/flash-list';
import React, {useEffect} from 'react';
import {ActivityIndicator, Image, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CmsSectionTypes} from '../../appTypes';
import {
  SectionArticle,
  SectionCarousel,
  SectionColumns,
  SectionFeatures,
  SectionHero,
} from '../../components';
import {useAppDispatch, useTypedSelector} from '../../sharetribeSetup';
import {
  fetchPageAssets,
  // pageAssetsErrorSelector,
  pageAssetsInProgressSelector,
  pageAssetsSelector,
} from '../../slices/hostedAssets.slice';
import {camelize, screenHeight, widthScale} from '../../util';
import {colors} from '../../theme';
import {useConfiguration} from '../../context';

const ASSET_NAME = 'landing-page';

export const Home = () => {
  const dispatch = useAppDispatch();
  const {top} = useSafeAreaInsets();
  const config = useConfiguration();
  const appLogo =
    config?.branding?.logoImageMobile?.attributes?.variants?.scaled2x.url ??
    config?.branding?.logoImageMobile?.attributes?.variants?.scaled.url ??
    '';
  const pageAssetsData = useTypedSelector(pageAssetsSelector);
  const inProgress = useTypedSelector(pageAssetsInProgressSelector);
  // const error = useTypedSelector(pageAssetsErrorSelector);

  useEffect(() => {
    const pageAsset = {landingPage: `content/pages/${ASSET_NAME}.json`};
    dispatch(fetchPageAssets(pageAsset));
  }, [dispatch]);

  const keyExtractor = (item: Record<string, string>, index: number) =>
    (item.sectionType + index).toString();

  const renderItem = ({item: elm}: {item: any}) => {
    // [SectionFeatures, SectionHero, SectionArticle, SectionColumns] These 4 can be used via 1 single component. On web-template, they have seperate components due to responsiveness and other things. Maybe in future we can eliminate all and use only 1.
    if (elm.sectionType === CmsSectionTypes.FEATURES) {
      return <SectionFeatures {...elm} />;
    } else if (elm.sectionType === CmsSectionTypes.HERO) {
      return <SectionHero {...elm} />;
    } else if (elm.sectionType === CmsSectionTypes.ARTICLE) {
      // return <SectionArticle {...elm} />;
    } else if (elm.sectionType === CmsSectionTypes.COLUMNS) {
      return <SectionColumns {...elm} />;
    } else if (elm.sectionType === CmsSectionTypes.CAROUSEL) {
      return <SectionCarousel {...elm} />;
    }
    return null;
  };

  const ListEmpty = () => {
    return inProgress ? (
      <ActivityIndicator size={'large'} style={styles.loader} />
    ) : (
      <Text>Something went wrong</Text>
    );
  };
  const sections = pageAssetsData?.[camelize(ASSET_NAME)]?.data?.sections || [];
  return (
    <View style={styles.container}>
      <View style={[styles.headerSection, {paddingTop: top}]}>
        <Image
          style={styles.appLogo}
          resizeMode="contain"
          source={{uri: appLogo}}
        />
      </View>
      <FlashList
        bounces={false}
        overScrollMode="never"
        nestedScrollEnabled={true}
        data={sections}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={ListEmpty}
        getItemType={item => {
          return item.sectionType;
        }}
        drawDistance={screenHeight * 2}
        contentContainerStyle={{paddingBottom: widthScale(100)}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerSection: {
    paddingLeft: widthScale(20),
  },
  appLogo: {
    marginVertical: widthScale(10),
    height: widthScale(30),
    width: widthScale(105),
  },
  loader: {
    marginTop: widthScale(300),
  },
});
