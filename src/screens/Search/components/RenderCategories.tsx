import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { useConfiguration } from '../../../context';
import { widthScale } from '../../../util';
import { fontWeight } from '../../../theme';
import { CheckBox } from '../../../components';
import { closeDropDownRight, openDropDownDown } from '../../../assets';

interface RenderCategoriesProps {
  level: number;
  handleCategoryPress: (categoryId: string, level: number) => void;
  selectedCategories: Record<string, string>;
  data: any[];
}

const RenderCategories = (props: RenderCategoriesProps) => {
  const { level = 1, handleCategoryPress, selectedCategories, data } = props;
  const config = useConfiguration();
  const categoryData = config.categoryConfiguration;
  return (
    <View
      style={[styles.container, level > 1 && { marginLeft: widthScale(16) }]}
    >
      {data.map(category => {
        const isSelected =
          selectedCategories[categoryData.categoryLevelKeys[level - 1]] ===
          category.id;
        return (
          <View key={category.id}>
            <View style={styles.categoryContainer}>
              <TouchableOpacity
                onPress={() => handleCategoryPress(category.id, level)}
              >
                <Image
                  source={isSelected ? openDropDownDown : closeDropDownRight}
                  style={styles.dropDown}
                  contentFit="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleCategoryPress(category.id, level)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.selectedCategoryText,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
              <CheckBox
                onPress={() => handleCategoryPress(category.id, level)}
                style={styles.checkBox}
                checked={isSelected}
              />
            </View>
            {selectedCategories[categoryData.categoryLevelKeys[level - 1]] ===
              category.id &&
              category.subcategories.length > 0 && (
                <RenderCategories
                  selectedCategories={selectedCategories}
                  handleCategoryPress={handleCategoryPress}
                  data={category.subcategories}
                  level={level + 1}
                />
              )}
          </View>
        );
      })}
    </View>
  );
};

export default RenderCategories;

const styles = StyleSheet.create({
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: widthScale(16),
  },

  categoryText: {
    fontSize: widthScale(16),
  },
  selectedCategoryText: {
    fontWeight: fontWeight.semiBold,
  },
  checkBox: {
    marginLeft: widthScale(10),
  },
  dropDown: {
    width: widthScale(25),
    height: widthScale(25),
  },
});
