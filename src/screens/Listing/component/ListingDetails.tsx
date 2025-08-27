import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Heading, Paragraph } from '../../../components'
import { colors } from '../../../theme'
import { widthScale } from '../../../util'
import isEqual from 'lodash/isEqual'
import { formatMoney } from '../../../util/currency'

interface ListingDetailsProps {
  title: string
  description: string
  price: {
    amount: number
    currency: string
  }
}

const ListingDetailsComponent = (props: ListingDetailsProps) => {
  const { title, description, price } = props
  return (
    <View style={styles.container}>
      <Heading
        color={colors.black}
        fieldType="heading3"
        content={title}
        containerStyle={styles.heading}
      />
      <Text>{formatMoney(price)}</Text>
      <Paragraph content={description} containerStyle={styles.paragraph} />
    </View>
  )
}

const ListingDetails = React.memo(
  ListingDetailsComponent,
  (prevProps, nextProps) => isEqual(prevProps, nextProps),
)
export default ListingDetails

const styles = StyleSheet.create({
  container: {
    marginHorizontal: widthScale(20),
    paddingBottom: widthScale(0),
    borderBottomWidth: 1,
    borderColor: colors.frostedGrey,
  },
  heading: {
    marginTop: widthScale(10),
  },
  paragraph: {
    marginBottom: 0,
  },
})
