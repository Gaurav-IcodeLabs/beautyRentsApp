import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { Thunk } from '../appTypes'
import defaultConfig from '../config/configDefault'
import { denormalizeAssetData } from '../util/data'
import { mergeConfig, storableError } from '../util'
import { RootState } from '../sharetribeSetup'

interface AssetData {
  appAssets: Record<string, string>
  pageAssetsData: null | Record<string, string>
  currentPageAssets: []
  version: null | number
  inProgress: boolean
  error: null | string
  translations: Record<string, any>
}

const initialState: AssetData = {
  // List of app-wide assets that should be fetched and their path in Asset API.
  // appAssets: { assetName: 'path/to/asset.json' }
  appAssets: {},
  pageAssetsData: null,
  currentPageAssets: [],

  version: null,
  inProgress: false,
  error: null,
  translations: {},
}

const assetsSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    setAppAssets: (state, { payload }) => {
      state.appAssets = payload.assets
      state.version = state.version || payload.versionInTranslationsCall
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchAppAssets.pending, (state, action) => {
      state.inProgress = true
      state.error = null
    })
    builder.addCase(fetchAppAssets.fulfilled, (state, { payload }) => {
      state.inProgress = false
      state.error = null
      state.translations = payload.translations
    })
    builder.addCase(fetchAppAssets.rejected, (state, { payload }) => {
      state.inProgress = false
      state.error = payload
    })

    builder.addCase(fetchPageAssets.pending, (state, { meta: { arg } }) => {
      state.inProgress = true
      state.currentPageAssets = Object.keys(arg)
      state.error = null
    })
    builder.addCase(fetchPageAssets.fulfilled, (state, { payload }) => {
      state.inProgress = false
      state.pageAssetsData = payload
    })
    builder.addCase(fetchPageAssets.rejected, (state, { payload }) => {
      state.inProgress = false
      state.error = payload
    })
  },
})

//helper
// Pick paths from entries of appCdnAssets config (in configDefault.js)
const pickHostedConfigPaths = (
  assetEntries: Record<string, string>[],
  excludeAssetNames: string,
) => {
  // E.g. allPaths = ['any/foo.json', 'any/bar.json']
  return assetEntries.reduce((pickedPaths, [name, path]) => {
    if (excludeAssetNames.includes(name)) {
      return pickedPaths
    }
    return [...pickedPaths, path]
  }, [])
}
const getFirstAssetData = response => response?.data?.data[0]?.attributes?.data
const getMultiAssetData = response => response?.data?.data
const getMultiAssetIncluded = response => response?.data?.included
const findJSONAsset = (assets, absolutePath) =>
  assets.find(
    a => a.type === 'jsonAsset' && a.attributes.assetPath === absolutePath,
  )
const getAbsolutePath = path => (path.charAt(0) !== '/' ? `/${path}` : path)

//thunks
export const fetchAppAssets = createAsyncThunk<{}, {}, Thunk>(
  'assets/fetchAppAssetsStatus',
  async (_, { dispatch, getState, extra: sdk }) => {
    const assets = defaultConfig.appCdnAssets
    const version = getState().assets.version

    // App-wide assets include 2 content assets: translations for microcopy and footer
    const translationsPath = assets.translations
    const footerPath = assets.footer

    // The rest of the assets are considered as configurations
    const assetEntries = Object.entries(assets)
    const nonConfigAssets = ['translations', 'footer']
    const configPaths = pickHostedConfigPaths(assetEntries, nonConfigAssets)

    // If version is given fetch assets by the version,
    // otherwise default to "latest" alias
    const fetchAssets = paths =>
      version
        ? sdk.assetsByVersion({ paths, version })
        : sdk.assetsByAlias({ paths, alias: 'latest' })

    const separateAssetFetches = [
      // This is a big file, better fetch it alone.
      // Then browser cache also comes into play.
      fetchAssets([translationsPath]),
      // Not a config, and potentially a big file.
      // It can benefit of browser cache when being a separate fetch.
      fetchAssets([footerPath]),
      // App configs
      fetchAssets(configPaths),
    ]

    const [translationAsset, footerAsset, configAssets] =
      await Promise.all(separateAssetFetches)

    const getVersionHash = response => response?.data?.meta?.version
    const versionInTranslationsCall = getVersionHash(translationAsset)
    const versionInFooterCall = getVersionHash(footerAsset)
    const versionInConfigsCall = getVersionHash(configAssets)
    const hasSameVersions =
      versionInTranslationsCall === versionInFooterCall &&
      versionInFooterCall === versionInConfigsCall

    // NOTE: making separate calls means that there might be version mismatch
    // when using 'latest' alias.
    // Since we only fetch translations and footer as a separate calls from configs,
    // there should not be major problems with this approach.
    // TODO: potentially show an error page or reload if version mismatch is detected.
    if (!version && !hasSameVersions) {
      //   console.warn("Asset versions between calls don't match.")
    }

    dispatch(setAppAssets({ assets, versionInTranslationsCall }))

    // Returned value looks like this for a single asset with name: "translations":
    // {
    //    translations: {
    //      path: 'content/translations.json', // an example path in Asset Delivery API
    //      data, // translation key & value pairs
    //    },
    // }
    const response = assetEntries.reduce((collectedAssets, assetEntry, i) => {
      const [name, path] = assetEntry

      if (nonConfigAssets.includes(name)) {
        // There are distinct calls for these assets
        const assetResponse =
          name === 'translations' ? translationAsset : footerAsset
        return {
          ...collectedAssets,
          [name]: { path, data: getFirstAssetData(assetResponse) },
        }
      }

      // Other asset path are assumed to be config assets
      const fetchedConfigAssets = getMultiAssetData(configAssets)
      const jsonAsset = findJSONAsset(
        fetchedConfigAssets,
        getAbsolutePath(path),
      )

      // branding.json config asset can contain image references,
      // which should be denormalized from "included" section of the response
      const data = denormalizeAssetData({
        data: jsonAsset?.attributes?.data,
        included: getMultiAssetIncluded(configAssets),
      })
      return { ...collectedAssets, [name]: { path, data } }
    }, {})

    const { translations: translationsRaw, ...rest } = response || {}
    // We'll handle translations as a separate data.
    // It's given to React Intl instead of pushing to config Context
    const translations = translationsRaw?.data || {}

    // Rest of the assets are considered as hosted configs
    const configEntries = Object.entries(rest)
    const hostedConfig = configEntries.reduce(
      (collectedData, [name, content]) => {
        return { ...collectedData, [name]: content.data || {} }
      },
      {},
    )

    const appConfig = mergeConfig(hostedConfig, defaultConfig)

    return {
      translations,
      appConfig,
    }
  },
)

export const fetchPageAssets = createAsyncThunk<{}, {}, Thunk>(
  'assets/fetchPageAssetsStatus',
  async (assets, { getState, extra: sdk }) => {
    try {
      const version = getState()?.assets?.version

      if (typeof version === 'undefined') {
        throw new Error(
          'App-wide assets were not fetched first. Asset version missing from Redux store.',
        )
      }

      // dispatch(pageAssetsRequested(Object.keys(assets)))

      // If version is given fetch assets by the version,
      // otherwise default to "latest" alias
      const fetchAssets = version
        ? assetPath => sdk.assetByVersion({ path: assetPath, version })
        : assetPath => sdk.assetByAlias({ path: assetPath, alias: 'latest' })

      const assetEntries = Object.entries(assets)
      const sdkAssets = assetEntries.map(([key, assetPath]) =>
        fetchAssets(assetPath),
      )

      const responses = await Promise.all(sdkAssets)

      const hostedAssetsState = getState()?.assets
      // These are fixed page assets that the app expects to be there. Keep fixed assets always in store.
      const { termsOfService, privacyPolicy, landingPage, ...rest } =
        hostedAssetsState?.pageAssetsData || {}
      const fixedPageAssets = { termsOfService, privacyPolicy, landingPage }
      // Avoid race condition, which might happen if automatic redirections try to fetch different assets
      // This could happen, when logged-in user clicks some signup link (AuthenticationPage fetches terms&privacy, LandingPage fetches its asset)
      const pickLatestPageAssetData =
        hostedAssetsState?.currentPageAssets.reduce((collected, pa) => {
          const cmsPageData = rest[pa]
          return cmsPageData ? { ...collected, [pa]: cmsPageData } : collected
        }, {})
      // Returned value looks like this for a single asset with name: "about-page":
      // {
      //    "about-page": {
      //      path: 'content/about-page.json', // an example path in Asset Delivery API
      //      data, // translation key & value pairs
      //    },
      //    // etc.
      // }
      // Note: we'll pick fixed page assets and the current page asset always.
      const pageAssets = assetEntries.reduce(
        (collectedAssets, assetEntry, i) => {
          const [name, path] = assetEntry
          const assetData = denormalizeAssetData(responses[i].data)
          return { ...collectedAssets, [name]: { path, data: assetData } }
        },
        { ...fixedPageAssets, ...pickLatestPageAssetData },
      )

      return pageAssets
    } catch (error) {
      return storableError(error)
    }
  },
)

export const pageAssetsSelector = (state: RootState) =>
  state.assets.pageAssetsData
export const pageAssetsInProgressSelector = (state: RootState) =>
  state.assets.inProgress
export const pageAssetsErrorSelector = (state: RootState) => state.assets.error

export const { setAppAssets } = assetsSlice.actions

export default assetsSlice.reducer
