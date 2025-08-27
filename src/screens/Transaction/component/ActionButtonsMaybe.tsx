import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Button } from '../../../components'
import { colors } from '../../../theme'
import { lightenColor } from '../../../util/data'
import { fontScale, widthScale } from '../../../util'

const ActionButtonsMaybe = props => {
  const {
    showButtons,
    primaryButtonProps,
    secondaryButtonProps,
    isListingDeleted,
    isProvider,
  } = props

  // In default processes default processes need special handling
  // Booking: provider should not be able to accept on-going transactions
  // Product: customer should be able to dispute etc. on-going transactions
  if (isListingDeleted && isProvider) {
    return null
  }

  const buttonsDisabled =
    primaryButtonProps?.inProgress || secondaryButtonProps?.inProgress
  const primaryButton = primaryButtonProps ? (
    <Button
      disabled={buttonsDisabled}
      loading={primaryButtonProps.inProgress}
      onPress={primaryButtonProps.onAction}
      text={primaryButtonProps.buttonText}
      style={[
        styles.primaryButtonStyle,
        secondaryButtonProps
          ? styles.bothButtonStyle
          : styles.singleButtonStyle,
      ]}
      textStyle={styles.primaryTextStyle}
    />
  ) : null

  const primaryErrorMessage = primaryButtonProps?.error ? (
    <Text style={styles.errorStyle}>{primaryButtonProps?.errorText}</Text>
  ) : null

  const secondaryButton = secondaryButtonProps ? (
    <Button
      disabled={buttonsDisabled}
      loading={secondaryButtonProps.inProgress}
      onPress={secondaryButtonProps.onAction}
      text={secondaryButtonProps.buttonText}
      style={[
        styles.secondaryButtonStyle,
        primaryButtonProps ? styles.bothButtonStyle : styles.singleButtonStyle,
      ]}
      textStyle={styles.secondaryTextStyle}
    />
  ) : null

  const secondaryErrorMessage = secondaryButtonProps?.error ? (
    <Text style={styles.errorStyle}>{secondaryButtonProps?.errorText}</Text>
  ) : null
  return showButtons ? (
    <>
      <View
        style={[
          styles.container,
          primaryButton && secondaryButton
            ? styles.containerForBoth
            : styles.containerForSingle,
        ]}>
        {primaryButton}
        {secondaryButton}
      </View>
      {primaryErrorMessage}
      {secondaryErrorMessage}
    </>
  ) : null
}

export default ActionButtonsMaybe

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: widthScale(24),
    flexDirection: 'row',
  },
  containerForSingle: {
    alignSelf: 'center',
  },
  containerForBoth: {
    justifyContent: 'space-between',
  },
  singleButtonStyle: {
    width: '100%',
  },
  bothButtonStyle: {
    width: '48%',
  },
  primaryButtonStyle: {
    backgroundColor: lightenColor(colors.success, 10),
    borderColor: colors.success,
    borderWidth: 1,
  },
  secondaryButtonStyle: {
    backgroundColor: lightenColor(colors.red, 10),
    borderColor: colors.red,
    borderWidth: 1,
  },
  primaryTextStyle: {
    color: colors.success,
  },
  secondaryTextStyle: {
    color: colors.red,
  },
  errorStyle: {
    alignSelf: 'center',
    color: colors.red,
    fontSize: fontScale(16),
    padding: widthScale(10),
  },
})
