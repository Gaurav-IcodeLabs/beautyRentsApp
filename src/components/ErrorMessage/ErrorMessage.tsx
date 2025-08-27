import { View } from 'react-native'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Heading } from '../Heading/Heading'
import { ErrorMessageProps, Headings } from '../../appTypes'
import { Paragraph } from '../Paragraph/Paragraph'

export const ErrorMessage = (props: ErrorMessageProps) => {
  const { invalidExistingListingType, noListingTypesSet, marketplaceName } =
    props
  const { t } = useTranslation()

  return invalidExistingListingType ? (
    <View>
      <Heading
        fieldType={Headings.HEADING2}
        content={t('EditListingDetailsPanel.invalidListingTypeSetTitle')}
      />
      <Paragraph
        content={
          <Trans
            i18nKey="EditListingDetailsPanel.invalidListingTypeSetDescription"
            values={{ marketplaceName }}
          />
        }
      />
    </View>
  ) : noListingTypesSet ? (
    <View>
      <Heading
        fieldType={Headings.HEADING2}
        content={t('EditListingDetailsPanel.noListingTypeSetTitle')}
      />
      <Paragraph
        content={t('EditListingDetailsPanel.noListingTypeSetDescription')}
      />
    </View>
  ) : null
}
