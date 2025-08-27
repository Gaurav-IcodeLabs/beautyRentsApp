import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import isEqual from 'lodash/isEqual';
import {
  LayoutAnimation,
  Modal,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cross } from '../../../assets';
import { Button, RangeSlider, RenderTextInputField } from '../../../components';
import { store, useAppDispatch } from '../../../sharetribeSetup';
import { colors, fontWeight } from '../../../theme';
import {
  fontScale,
  PRIMARY_FILTER,
  SCHEMA_TYPE_ENUM,
  SCHEMA_TYPE_TEXT,
  widthScale,
} from '../../../util';
import { handleCategoryPress, handleMultipleSelect } from '../helper';
import {
  defaultSearchParams,
  searchListings,
  searchParamsSelector,
} from '../Search.slice';
import RenderCategories from './RenderCategories';
import SectionListItem from './SectionListItem';
import { ListingSearchTypes } from '../../../appTypes';
import { useForm } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const HIGHEST_VALUE = 100000;
const LOWEST_VALUE = 0;
const FilterModal = props => {
  const [range, setRange] = useState({
    low: LOWEST_VALUE,
    high: HIGHEST_VALUE,
  });
  const { visible, onRequestClose, config, activeSortKey, searchType } = props;
  const showTextFilter = searchType === ListingSearchTypes.LOCATION;
  const [selectedCategories, setSelectedCategories] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});
  const dispatch = useAppDispatch();
  const { top, bottom } = useSafeAreaInsets();
  const categoryData = config.categoryConfiguration;
  const { t } = useTranslation();

  const {
    control,
    getValues,
    setValue,
    formState: { isValid },
  } = useForm({
    defaultValues: {
      keywords: '',
    },
    mode: 'onChange',
  });

  const isPriceFilterActive = !isEqual(range, {
    low: LOWEST_VALUE,
    high: HIGHEST_VALUE,
  });

  const prieceFilter = isPriceFilterActive
    ? { price: `${range.low},${range.high}` }
    : {};
  // Filter out text filters and filters with indexForSearch: false
  const filteredCustomFilters = useMemo(() => {
    const { listingFields } = config?.listing || {};
    return listingFields
      .filter(
        filter =>
          filter.schemaType !== SCHEMA_TYPE_TEXT &&
          filter.filterConfig.indexForSearch,
      )
      .sort((a, b) => {
        const groupA = a.filterConfig.group.toLowerCase();
        const groupB = b.filterConfig.group.toLowerCase();
        if (groupA === PRIMARY_FILTER && groupB !== PRIMARY_FILTER) return -1;
        if (groupA !== PRIMARY_FILTER && groupB === PRIMARY_FILTER) return 1;
        return 0;
      });
  }, [config]);

  const handleSearchQuery = () => {
    const params = Object.entries(selectedCategories).reduce(
      (acc, [key, value]) => {
        acc[`pub_${key}`] = value;
        return acc;
      },
      {},
    );

    Object.entries(selectedFilters).forEach(([key, value]) => {
      const item = filteredCustomFilters.find(filter => filter.key === key);
      params[`pub_${key}`] =
        item.schemaType === SCHEMA_TYPE_ENUM
          ? value.join(',')
          : `has_all:${value.join(',')}`;
    });

    const searchParams = searchParamsSelector(store.getState());
    const keywords = getValues('keywords');
    const keywordsFilter = keywords ? { keywords: `${keywords}` } : {};
    dispatch(
      searchListings({
        searchParams: {
          ...searchParams,
          ...params,
          ...prieceFilter,
          ...keywordsFilter,
          sort: activeSortKey,
          page: 1,
        },
        config,
      }),
    );
    onRequestClose();
  };

  const resetSearchQuery = () => {
    setSelectedCategories({});
    setSelectedFilters({});
    setValue('keywords', '');
    dispatch(
      searchListings({
        searchParams: defaultSearchParams(config),
        config,
      }),
    );
    setRange({ low: LOWEST_VALUE, high: HIGHEST_VALUE });
    onRequestClose();
  };

  LayoutAnimation.easeInEaseOut();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <View style={styles.container}>
        <View style={[styles.header, { marginTop: top }]}>
          <View style={styles.headerInnerUpperConteainer}>
            <TouchableOpacity onPress={onRequestClose}>
              <Image contentFit="contain" source={cross} style={styles.cross} />
            </TouchableOpacity>
          </View>
          <View style={[styles.headerInnerContent]}>
            <Text style={styles.heading}>
              {t('SearchFiltersMobile.heading')}
            </Text>
            <TouchableOpacity onPress={() => resetSearchQuery()}>
              <Text>{t('SearchFiltersMobile.resetAll')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollView}
        >
          <View style={styles.categoryContainer}>
            <Text style={styles.contentLable}>
              {t('FilterComponent.categoryLabel')}
            </Text>
            <RenderCategories
              handleCategoryPress={(categoryId, level) =>
                handleCategoryPress(
                  categoryId,
                  level,
                  setSelectedCategories,
                  categoryData,
                )
              }
              level={1}
              selectedCategories={selectedCategories}
              data={categoryData.categories}
            />
          </View>
          <View style={styles.sectionContainer}>
            <SectionList
              scrollEnabled={false}
              sections={filteredCustomFilters.map(filter => ({
                title: filter.filterConfig.label, // Use group as section title
                data: [filter], // Each filter becomes a section with one item
              }))}
              keyExtractor={item => item.key}
              renderItem={({ item }) => (
                <SectionListItem
                  selectedFilters={selectedFilters}
                  item={item}
                  handleMultipleSelect={(schemaType, key, option) =>
                    handleMultipleSelect(
                      schemaType,
                      key,
                      option,
                      setSelectedFilters,
                    )
                  }
                />
              )}
              renderSectionHeader={({ section: { title } }) => (
                <Text style={styles.contentLable}>{title}</Text>
              )}
              renderSectionFooter={() => <View style={styles.sectionFooter} />}
            />
          </View>
          <View style={styles.keywordsContainer}>
            <RenderTextInputField
              control={control}
              name="keywords"
              labelKey="FilterComponent.keywordsLabel"
              placeholderKey="KeywordFilter.placeholder"
              style={styles.keywordsInput}
            />
          </View>

          <View style={styles.rangeContainer}>
            <Text style={styles.contentLable}>{t('PriceFilter.label')}</Text>
            <Text style={styles.rangeLabel}>
              {t('PriceFilter.labelSelectedPlain', {
                minPrice: `$ ${range.low}`,
                maxPrice: `$ ${range.high}`,
              })}
            </Text>
            <RangeSlider
              valueHigh={range.high}
              valueLow={range.low}
              initialValue={{ low: LOWEST_VALUE, high: HIGHEST_VALUE }}
              handleValueChange={(low, high) => {
                setRange({ low, high });
              }}
              style={styles.rangeSlider}
            />
          </View>
        </KeyboardAwareScrollView>
        <Button
          style={[styles.button, { marginBottom: bottom + widthScale(20) }]}
          text="Search"
          onPress={handleSearchQuery}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    fontWeight: fontWeight.bold,
    color: colors.black,
    fontSize: fontScale(22),
    lineHeight: fontScale(24),
  },
  header: {
    height: widthScale(90),
    borderBottomWidth: 1,
    borderColor: colors.frostedGrey,
    paddingHorizontal: widthScale(16),
  },
  headerInnerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  headerInnerUpperConteainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: widthScale(16),
  },
  cross: {
    width: widthScale(20),
    height: widthScale(20),
  },
  button: {
    marginHorizontal: widthScale(16),
  },
  scrollView: {
    paddingTop: widthScale(20),
  },
  sectionContainer: {
    marginBottom: widthScale(16),
    borderColor: colors.frostedGrey,
    marginHorizontal: widthScale(16),
  },
  categoryContainer: {
    borderBottomWidth: 1,
    paddingBottom: widthScale(6),
    borderColor: colors.frostedGrey,
    marginHorizontal: widthScale(16),
    marginBottom: widthScale(16),
  },
  contentLable: {
    fontWeight: fontWeight.medium,
    color: colors.grey,
    fontSize: fontScale(14),
    marginBottom: widthScale(10),
  },
  sectionFooter: {
    borderBottomWidth: 1,
    borderColor: colors.frostedGrey,
    marginTop: widthScale(6),
  },
  rangeSlider: {
    marginHorizontal: widthScale(5),
  },
  rangeContainer: {
    marginHorizontal: widthScale(16),
    marginBottom: widthScale(16),
  },
  rangeLabel: {
    fontWeight: fontWeight.medium,
    color: colors.grey,
    fontSize: fontScale(14),
    marginBottom: widthScale(20),
  },
  keywordsInput: {
    marginBottom: widthScale(20),
  },
  keywordsContainer: {
    marginHorizontal: widthScale(16),
    marginBottom: widthScale(16),
    borderBottomWidth: 1,
    borderColor: colors.frostedGrey,
  },
});

export default FilterModal;
