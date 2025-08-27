import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import {
  CategoryFieldProps,
  FieldSelectCategoryProps,
} from '../../../appTypes';
import {
  commonShadow,
  fontScale,
  heightScale,
  screenWidth,
  widthScale,
} from '../../../util';
import { useColors } from '../../../context';
import { AppColors, colors, fontWeight } from '../../../theme';

// Finds the correct subcategory within the given categories array based on the provided categoryIdToFind.
const findCategoryConfig = (categories, categoryIdToFind) => {
  return categories?.find(category => category.id === categoryIdToFind);
};

const CategoryField = (props: CategoryFieldProps) => {
  const {
    currentCategoryOptions,
    level,
    values,
    prefix,
    handleCategoryChange,
    control,
    t,
  } = props;
  const colors: AppColors = useColors();
  const [isFocus, setIsFocus] = useState(false);
  const currentCategoryKey = `${prefix}${level}`;

  const categoryConfig = findCategoryConfig(
    currentCategoryOptions,
    values[`${prefix}${level}`],
  );

  return (
    <>
      {currentCategoryOptions ? (
        <Controller
          control={control}
          name={currentCategoryKey}
          render={({ field: { value, onChange, onBlur } }) => (
            <View
              style={[
                styles.fieldContainer,
                isFocus && { borderColor: colors.marketplaceColor },
              ]}
            >
              <Text style={styles.label}>
                {t('FilterComponent.categoryLabel')}
              </Text>
              <Dropdown
                style={[styles.dropdown]}
                data={currentCategoryOptions}
                maxHeight={300}
                labelField="name"
                valueField="id"
                placeholder="Select Category"
                value={value}
                onBlur={onBlur}
                iconColor={colors.black}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                onChange={item => {
                  onChange(item.id);
                  handleCategoryChange(item.id, level, currentCategoryOptions);
                }}
                renderItem={(item, selected) => {
                  return (
                    <View
                      style={[
                        styles.item,
                        {
                          backgroundColor: selected
                            ? colors.marketplaceColorLight
                            : colors.white,
                        },
                      ]}
                    >
                      <Text style={styles.itemText}>{item?.name}</Text>
                    </View>
                  );
                }}
              />
            </View>
          )}
        />
      ) : null}

      {categoryConfig?.subcategories?.length > 0 ? (
        <CategoryField
          currentCategoryOptions={categoryConfig.subcategories}
          level={level + 1}
          values={values}
          prefix={prefix}
          handleCategoryChange={handleCategoryChange}
          control={control}
          t={t}
        />
      ) : null}
    </>
  );
};

const FieldSelectCategory = (props: FieldSelectCategoryProps) => {
  const {
    prefix,
    listingCategories,
    control,
    watch,
    setValue,
    setAllCategoriesChosen,
    t,
  } = props;
  const values = watch();

  useEffect(() => {
    checkIfInitialValuesExist();
  }, []);

  // Counts the number of selected categories in the form values based on the given prefix.
  const countSelectedCategories = () => {
    return Object.keys(values).filter(key => key.startsWith(prefix)).length;
  };

  // Checks if initial values exist for categories and sets the state accordingly.
  // If initial values exist, it sets `allCategoriesChosen` state to true; otherwise, it sets it to false
  const checkIfInitialValuesExist = () => {
    const count = countSelectedCategories(values, prefix);
    setAllCategoriesChosen(count > 0);
  };

  // If a parent category changes, clear all child category values
  const handleCategoryChange = (category, level, currentCategoryOptions) => {
    const selectedCatLenght = countSelectedCategories();
    if (level < selectedCatLenght) {
      for (let i = selectedCatLenght; i > level; i--) {
        setValue(`${prefix}${i}`, null);
      }
      setValue('title', '');
      setValue('description', '');
    }
    const categoryConfig = findCategoryConfig(
      currentCategoryOptions,
      category,
    ).subcategories;
    setAllCategoriesChosen(!categoryConfig || categoryConfig.length === 0);
  };

  return (
    <View>
      <CategoryField
        currentCategoryOptions={listingCategories}
        level={1}
        values={values}
        prefix={prefix}
        handleCategoryChange={handleCategoryChange}
        control={control}
        t={t}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    height: heightScale(50),
    paddingHorizontal: widthScale(10),
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: widthScale(12),
  },
  label: {
    marginBottom: widthScale(10),
    fontWeight: fontWeight.semiBold,
    fontSize: fontScale(14),
    color: colors.black,
  },
  fieldContainer: {
    // borderWidth: 1,
    width: screenWidth - widthScale(40),
    marginBottom: widthScale(20),
    paddingVertical: widthScale(10),
    borderRadius: widthScale(10),
  },
  item: {
    padding: widthScale(10),
  },
  itemText: {
    fontSize: fontScale(14),
    color: colors.black,
  },
  placeholderStyle: {
    fontSize: fontScale(14),
  },
  selectedTextStyle: {
    fontSize: fontScale(14),
  },
  inputSearchStyle: {
    height: heightScale(40),
    fontSize: fontScale(14),
  },
  iconStyle: {
    width: heightScale(20),
    height: widthScale(20),
  },
});

export default FieldSelectCategory;
