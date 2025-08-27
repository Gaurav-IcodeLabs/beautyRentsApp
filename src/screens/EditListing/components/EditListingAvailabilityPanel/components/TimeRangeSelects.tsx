import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { TimeSlotDropdown } from '../../../../../components'
import { filterEndHours } from '../EditListingAvailabilityPanel.helper'
import { cross } from '../../../../../assets'
import { widthScale } from '../../../../../util'

const TimeRangeSelects = props => {
  const {
    index,
    availableStartHours,
    availableEndHours,
    value,
    update,
    onRemove,
    entries,
  } = props

  return (
    <View style={styles.container}>
      <TimeSlotDropdown
        isModal={false}
        data={availableStartHours.map(tz => ({
          label: tz,
          option: tz,
        }))}
        containerStyle={styles.containerWidth}
        value={value.startTime}
        onValueChange={item => {
          update(index, {
            startTime: item.option,
            endTime: value.endTime,
          })
        }}
      />
      <TimeSlotDropdown
        isModal={false}
        data={filterEndHours(availableEndHours, entries, index).map(tz => ({
          label: tz,
          option: tz,
        }))}
        containerStyle={styles.containerWidth}
        value={value.endTime}
        onValueChange={item => {
          update(index, {
            startTime: value.startTime,
            endTime: item.option,
          })
        }}
      />

      <TouchableOpacity onPress={() => onRemove(index)}>
        <Image source={cross} style={styles.removeStyle} />
      </TouchableOpacity>
    </View>
  )
}

export default TimeRangeSelects

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  containerWidth: {
    width: '40%',
  },
  removeStyle: {
    width: widthScale(20),
    height: widthScale(20),
  },
})
