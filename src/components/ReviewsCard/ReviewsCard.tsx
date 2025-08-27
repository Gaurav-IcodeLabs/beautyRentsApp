import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { commonShadow, fontScale, heightScale, widthScale } from '../../util';
import moment from 'moment';
import { Avatar } from '../Avatar/Avatar';
import { colors, fontWeight } from '../../theme';
import { Rating } from '../Rating';

export const ReviewsCard = (props) => {
    const {
        author,
        attributes: {createdAt, rating, content},
      } = props.review;
      const {displayName} = author.attributes.profile || {};
      const formattedDate = moment(createdAt).fromNow();
      return (
        <View style={styles.reviewContainer}>
          <View style={styles.innerContainer}>
            <Avatar size={widthScale(60)} user={author} />
            <View style={styles.middleContainer}>
              <Text style={styles.name}>{displayName}</Text>
              <View style={styles.detailContainer}>
                <Text style={styles.rating}>{rating}</Text>
                <Rating starSize={15} initialRating={rating} />
              </View>
            </View>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
          <View style={styles.contentSection}>
            <Text style={styles.content}>{content}</Text>
          </View>
        </View>
      );
    };
    const styles = StyleSheet.create({
      name: {
        fontSize: fontScale(18),
        fontWeight: fontWeight.bold,
      },
      reviewContainer: {
        marginTop: heightScale(8),
        backgroundColor: colors.white,
        borderRadius: widthScale(10),
        overflow: 'hidden',
        ...commonShadow,
      },
      middleContainer: {
        flex: 1,
        paddingLeft: widthScale(10),
        paddingTop: heightScale(5),
      },
      innerContainer: {
        padding: heightScale(10),
        flexDirection: 'row',
      },
      contentSection: {
        marginBottom: heightScale(20),
        paddingHorizontal: widthScale(15),
      },
      content: {
        fontSize: fontScale(12),
        fontWeight: fontWeight.normal,
      },
      rating: {
        fontSize: fontScale(15),
        marginRight: widthScale(5),
        fontWeight: fontWeight.normal,
      },
      detailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: heightScale(5),
      },
      date: {
        fontSize: fontScale(10),
        fontWeight: fontWeight.normal,
        color: colors.darkGrey,
      },
    });