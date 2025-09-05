import { View } from 'react-native';
import React from 'react';
import { getTimeZoneNames } from '../../../../../util';
import { RenderDropdownField } from '../../../../../components';
import { useTranslation } from 'react-i18next';

// IANA database contains irrelevant time zones too.
const relevantZonesPattern = new RegExp(
  '^(Africa|America(?!/(Argentina/ComodRivadavia|Knox_IN|Nuuk))|Antarctica(?!/(DumontDUrville|McMurdo))|Asia(?!/Qostanay)|Atlantic|Australia(?!/(ACT|LHI|NSW))|Europe|Indian|Pacific)',
);

const timezoneResult = getTimeZoneNames(relevantZonesPattern).map(tz => ({
  label: tz,
  option: tz,
}));

const FieldTimeZoneSelect = props => {
  const { t } = useTranslation();
  const { control, name } = props;
  return (
    <View>
      <RenderDropdownField
        control={control}
        name={name}
        labelField="label"
        valueField="option"
        data={timezoneResult}
        lableKey={t('EditListingAvailabilityPlanForm.timezonePickerTitle')}
        onDropDownValueChange={(value, cb) => {
          cb(value.option);
        }}
      />
    </View>
  );
};

export default FieldTimeZoneSelect;
