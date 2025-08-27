import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { FlashList } from '@shopify/flash-list'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Keyboard,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  Listing,
  ListingSearchTypes,
  ListingSortKeys,
  SearchScreenProps,
} from '../../appTypes'
import { searchIcon } from '../../assets'
import {
  ListingCardMain,
  LocationModal,
  SelectionButton,
} from '../../components'
import RenderSearchInputField from '../../components/RenderSearchInputField/RenderSearchInputField'
import { useColors, useConfiguration } from '../../context'
import { store, useAppDispatch, useTypedSelector } from '../../sharetribeSetup'
import {
  entitiesSelector,
  getListingsById,
} from '../../slices/marketplaceData.slice'
import { colors } from '../../theme'
import {
  commonShadow,
  fontScale,
  heightScale,
  screenHeight,
  widthScale,
} from '../../util'
import BottomSheetSort from './components/BottomSheetSort'
import FilterModal from './components/FilterModal'
import { createBounds } from './helper'
import {
  currentListingIdsSelector,
  loadData,
  searchInProgressSelector,
  searchListings,
  searchParamsSelector,
} from './Search.slice'

export const Search: React.FC<SearchScreenProps> = ({ navigation }) => {
  const config = useConfiguration()
  const { top } = useSafeAreaInsets()
  const color = useColors()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [activeSort, setActiveSort] = useState<string | null>(null)
  const [refreshing, setRefreshing] = React.useState(false)
  const sheetRef = React.useRef(null)
  const locationModalRef = React.useRef(null)
  const searchInProgress = useTypedSelector(searchInProgressSelector)
  const entities = useTypedSelector(entitiesSelector)
  const currentPageResultIds = useTypedSelector(currentListingIdsSelector)
  const listings = getListingsById(entities, currentPageResultIds)
  const { searchType } = config?.search?.mainSearch
  const { options: sortData } = config?.search?.sortConfig
  const searchParams = useTypedSelector(searchParamsSelector)
  const isPubPresent = Object.keys(searchParams).some(
    key => key.startsWith('pub_') || key.startsWith('price'),
  )
  const newestSort = sortData.find(sort => sort.key === ListingSortKeys.NEWEST)
  useEffect(() => {
    loadData(config)
    setActiveSort(newestSort?.labelTranslationKey)
  }, [config])

  const keyExtractor = (item: Listing) => item.id.uuid.toString()

  const ListEmpty = () => {
    return searchInProgress ? (
      <ActivityIndicator size={'large'} style={styles.loader} />
    ) : (
      <>
        <Text>{t('SearchPage.noResults')}</Text>
      </>
    )
  }

  const {
    control,
    formState: { isValid },
    setValue,
  } = useForm({
    defaultValues: {
      geolocation: '',
      address: '',
    },
    mode: 'onChange',
  })

  const onSelectLocaion = (key, value) => {
    const searchParams = searchParamsSelector(store.getState())
    const activeSortKey = sortData.find(
      (sort: any) => sort.labelTranslationKey === activeSort,
    )?.key

    if (!key && !value) {
      const newSearchParams = { ...searchParams }
      delete newSearchParams.bounds
      dispatch(
        searchListings({
          searchParams: {
            ...newSearchParams,
            sort: activeSortKey,
            page: 1,
          },
          config,
        }),
      )
      locationModalRef.current?.clearField()
      setValue('address', '')
      setValue('geolocation', '')
      return
    }
    setValue(key, value)

    if (key === 'geolocation') {
      const bounds = createBounds(value.lat, value.lng)
      dispatch(
        searchListings({
          searchParams: {
            ...searchParams,
            sort: activeSortKey,
            bounds,
            page: 1,
          },
          config,
        }),
      )
    }
  }

  const handleOnRefresh = () => {
    loadData(config)
  }

  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        <View style={{ ...styles.searchContainer, paddingTop: top }}>
          <RenderSearchInputField
            isShadow={false}
            searchFieldStyle={styles.searchFieldStyle}
            placeholderKey={'TopbarSearchForm.placeholder'}
            placeholderTextColor={colors.grey}
            icon={searchIcon}
            name="address"
            control={control}
            iconStyle={styles.iconStyle}
            inputStyles={styles.inputStyles}
            onPress={() => {
              if (searchType === ListingSearchTypes.LOCATION) {
                setShowModal(true)
              }
            }}
            onClear={() => {
              setValue('address', '')
              setValue('geolocation', '')
              onSelectLocaion()
            }}
            editable={searchType !== ListingSearchTypes.LOCATION}
          />

          {searchType === ListingSearchTypes.LOCATION && (
            <LocationModal
              ref={locationModalRef}
              visible={showModal}
              onModalClose={() => {
                setShowModal(false)
                Keyboard.dismiss()
              }}
              renderSearchInputField={true}
              onSelectLocation={onSelectLocaion}
              control={control}
              t={t}
              showLabel={false}
              placeholderKey={'TopbarSearchForm.placeholder'}
            />
          )}

          <View style={styles.btnContainer}>
            <SelectionButton
              title={t('SearchFiltersMobile.filtersButtonLabel')}
              isSelected={isPubPresent}
              onPress={() => {
                setVisible(true)
              }}
              style={styles.filterButton}
            />
            <SelectionButton
              title={t(`${activeSort}`)}
              isSelected={false}
              onPress={() => sheetRef.current?.present()}
              style={styles.filterButton}
            />
            <SelectionButton
              title={t('SearchFiltersMobile.openMapView')}
              isSelected={false}
              onPress={() => {
                navigation.navigate('SearchListingMap')
              }}
            />
          </View>
        </View>

        <FlashList
          data={listings}
          keyExtractor={keyExtractor}
          ListEmptyComponent={ListEmpty}
          estimatedItemSize={383}
          showsVerticalScrollIndicator={false}
          drawDistance={screenHeight * 2}
          renderItem={({ item }) => {
            return (
              <View style={styles.listContainer}>
                <ListingCardMain listing={item} />
              </View>
            )
          }}
          refreshing={refreshing}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                handleOnRefresh()
              }}
            />
          }
          contentContainerStyle={styles.containerFlatList}
        />

        <FilterModal
          activeSortKey={
            sortData.find(
              (sort: any) => sort.labelTranslationKey === activeSort,
            )?.key
          }
          visible={visible}
          onRequestClose={() => setVisible(false)}
          config={config}
          searchType={searchType}
        />

        <BottomSheetSort
          activeSort={activeSort}
          setActiveSort={setActiveSort}
          t={t}
          sheetRef={sheetRef}
          sortData={sortData}
        />
      </View>
    </BottomSheetModalProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    backgroundColor: colors.white,
    zIndex: 1,
    ...commonShadow,
  },
  loader: {
    marginTop: widthScale(250),
  },
  listContainer: {
    marginBottom: heightScale(20),
  },
  containerFlatList: {
    padding: widthScale(20),
  },
  searchFieldStyle: {
    borderRadius: widthScale(12),
    paddingHorizontal: widthScale(20),
    marginBottom: heightScale(16),
    marginHorizontal: widthScale(20),
  },

  iconStyle: {
    width: widthScale(25),
    height: widthScale(25),
    tintColor: colors.grey,
  },
  inputStyles: {
    marginHorizontal: widthScale(10),
    color: colors.black,
    fontSize: fontScale(14),
  },
  filterBtn: {
    paddingVertical: heightScale(10),
    paddingHorizontal: widthScale(15),
    borderRadius: widthScale(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnContainer: {
    flexDirection: 'row',
    marginHorizontal: widthScale(20),
    marginBottom: heightScale(16),
  },
  btnText: { color: colors.white },
  filterButton: {
    marginRight: widthScale(10),
  },
  filterText: {
    marginTop: heightScale(10),
  },
})
