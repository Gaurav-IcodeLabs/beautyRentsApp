import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import React, { FC } from 'react'
import { ScreenHeader } from '../../../components'
import { Controller } from 'react-hook-form'

import { supportedCountriesWithNames } from '../../../config/configStripe'
import { heightScale, widthScale } from '../../../util'
type SelectCountryModalProps = {
  isModalVisible: boolean
  setModalVisible: (value: boolean) => void
  control: any
  name: string
}
const SelectCountryModal: FC<SelectCountryModalProps> = props => {
  const { isModalVisible, setModalVisible, control, name } = props
  return (
    <Modal visible={isModalVisible} animationType="slide" transparent={!true}>
      <View style={styles.modalBg}>
        <ScreenHeader
          title="Select Country"
          onLeftIconPress={() => setModalVisible(false)}
        />
        {/* marketPlaceConfig.stripe.supportedCountries.map */}
        <ScrollView contentContainerStyle={styles.paddingB}>
          <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value } }) => {
              return supportedCountriesWithNames.map((item, index) => (
                <View key={item.code}>
                  <TouchableOpacity
                    onPress={() => {
                      onChange(item)
                      setModalVisible(false)
                    }}
                    key={index}>
                    <Text
                      style={[
                        styles.countryText,
                        value && value.name === item.name && styles.extraWght,
                      ]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                  {index < supportedCountriesWithNames.length - 1 && (
                    <View style={styles.seprator} />
                  )}
                </View>
              ))
            }}
          />
        </ScrollView>
      </View>
    </Modal>
  )
}

export default SelectCountryModal

const styles = StyleSheet.create({
  modalBg: {
    flex: 1,
  },
  seprator: {
    height: 1,
    backgroundColor: 'grey',
    opacity: 0.3,
  },
  countryText: {
    fontWeight: '500',
    fontSize: 16,
    marginVertical: heightScale(15),
    marginHorizontal: widthScale(20),
  },
  paddingB: {
    paddingBottom: heightScale(100),
  },
  extraWght: {
    fontWeight: '800',
  },
})
