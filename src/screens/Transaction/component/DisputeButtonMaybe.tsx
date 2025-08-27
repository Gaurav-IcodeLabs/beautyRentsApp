import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Button } from '../../../components'
import { useTranslation } from 'react-i18next'
import { widthScale } from '../../../util'
import { lightenColor } from '../../../util/data'
import { colors } from '../../../theme'

const DisputeButtonMaybe = props => {
  const { t } = useTranslation()
  const { setDisputeModalOpen } = props
  return (
    <View style={styles.container}>
      <Button
        onPress={setDisputeModalOpen}
        text={t('TransactionPanel.disputeOrder')}
        style={styles.buttonStyle}
        textStyle={styles.buttonTextStyle}
      />
    </View>
  )
}

export default DisputeButtonMaybe

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: widthScale(24),
    paddingVertical: widthScale(10),
  },
  buttonStyle: {
    backgroundColor: lightenColor(colors.grey, 10),
    borderColor: colors.grey,
    borderWidth: 1,
  },
  buttonTextStyle: {
    color: colors.grey,
  },
})
