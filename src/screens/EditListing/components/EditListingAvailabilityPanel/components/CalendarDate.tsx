import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useColors } from '../../../../../context'
import { AppColors } from '../../../../../theme'
import { parseDateFromISO8601, widthScale } from '../../../../../util'
import ColoredView from './ColoredView'
import PlanEntry from './PlanEntry'

const CalendarDate = props => {
  const { availabilityData, hasAvailability, isDaily, useFullDays, timeZone } =
    props

  const colorsData: AppColors = useColors()

  const hasPlanEntries = availabilityData?.planEntries?.length > 0
  const hasExceptions = availabilityData?.exceptions?.length > 0
  const availableExceptions = availabilityData.exceptions.filter(
    e => e.attributes.seats > 0,
  )
  const blockingExceptions = availabilityData.exceptions.filter(
    e => e.attributes.seats === 0,
  )
  const date = parseDateFromISO8601(availabilityData?.id, timeZone)

  return (
    <View style={styles.tableView}>
      {hasPlanEntries ? (
        <>
          {hasAvailability && !hasPlanEntries && (
            <ColoredView color={colorsData.marketplaceColor} />
          )}
          <View>
            {availabilityData.planEntries.map((e, i) => {
              return (
                <View key={`entry${i}`} style={styles.timeRangeContainer}>
                  <ColoredView color={colorsData.marketplaceColor} />
                  <PlanEntry
                    key={`entry${i}`}
                    date={date}
                    entry={e}
                    timeZone={timeZone}
                    isDaily={isDaily}
                    useFullDays={useFullDays}
                  />
                </View>
              )
            })}
          </View>
        </>
      ) : null}
    </View>
  )
}

export default CalendarDate

const styles = StyleSheet.create({
  tableView: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: widthScale(4),
  },
})
