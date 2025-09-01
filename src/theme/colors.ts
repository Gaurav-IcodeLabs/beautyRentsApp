import { Colors } from '../appTypes';

export interface AppColors extends Record<Colors, string> {}

export const colors: AppColors = {
  marketplaceColor: '#FF9199',
  marketplaceColorLight: '#7748d5',
  marketplaceColorDark: '#492296',
  colorPrimaryButton: '#D8ADA6',
  colorPrimaryButtonLight: '#239954',
  colorPrimaryButtonDark: '#f0fff6',

  grey: '#ACB5BB',
  lightGrey: '#EDF1F3',
  transparent: 'transparent',
  itemBGGrey: '#F9F9F9',
  error: '#FF0000',
  white: '#ffffff',
  black: '#212121',
  frostedGrey: '#D9D9D9',
  success: '#2ecc71',
  orange: '#FFA800',
  red: '#8B0000',
  lightRedColor: '#B22222',
  listingBackground: '#F2F2F2',
  greyishWhite: '#F0F0F0',
  darkGrey: '#949494',
  lightestGrey: '#FAFAFA',
  savedCardBackground: '#F5F5F5',
};

export const mergeColors = (appColors: Partial<AppColors>) => ({
  ...colors,
  marketplaceColor: appColors.marketplaceColor,
  marketplaceColorLight: appColors.marketplaceColorLight,
  marketplaceColorDark: appColors.marketplaceColorDark,
  colorPrimaryButton: appColors.colorPrimaryButton,
  colorPrimaryButtonLight: appColors.colorPrimaryButtonLight,
  colorPrimaryButtonDark: appColors.colorPrimaryButtonDark,
});
