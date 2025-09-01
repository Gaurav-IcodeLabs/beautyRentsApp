import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import { starFilled, starUnfilled } from '../../assets';
import { heightScale, widthScale } from '../../util';
import { colors } from '../../theme';

interface RatingProps {
  initialRating?: number;
  totalStars: number;
  onRatingChange?: (rating: number) => void;
  starSize?: number;
}

export const Rating = ({
  initialRating,
  totalStars = 5,
  onRatingChange,
  starSize = 25,
}: RatingProps) => {
  const [rating, setRating] = useState(initialRating || 0);
  const [isEditable, setIsEditable] = useState(initialRating === undefined);

  useEffect(() => {
    if (initialRating !== undefined) {
      setRating(initialRating);
      setIsEditable(false);
    }
  }, [initialRating]);

  const handlePress = index => {
    if (isEditable) {
      const newRating = index + 1;
      setRating(newRating);
      if (onRatingChange) {
        onRatingChange(newRating);
      }
    }
  };

  return (
    <View style={styles.container}>
      {[...Array(totalStars)].map((_, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handlePress(index)}
          disabled={!isEditable}
        >
          <Image
            tintColor={
              index < rating ? colors.marketplaceColor : colors.lightGrey
            }
            source={index < rating ? starFilled : starUnfilled}
            style={[
              styles.star,
              { width: widthScale(starSize), height: heightScale(starSize) },
            ]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: widthScale(5),
  },
});
