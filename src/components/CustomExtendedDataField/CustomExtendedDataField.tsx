import React from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CustomFieldProps, FieldConfig } from '../../appTypes';
import { useColors } from '../../context';
import { AppColors, colors, fontWeight } from '../../theme';
import {
  fontScale,
  SCHEMA_TYPE_ENUM,
  SCHEMA_TYPE_LONG,
  SCHEMA_TYPE_MULTI_ENUM,
  SCHEMA_TYPE_TEXT,
  widthScale,
} from '../../util';
import { RenderDropdownField } from '../RenderDropdownField/RenderDropdownField';
import { RenderTextInputField } from '../RenderTextInputField/RenderTextInputField';

const getLabel = (fieldConfig: FieldConfig | undefined) =>
  fieldConfig?.saveConfig?.label || fieldConfig?.label;

const CustomFieldText = (props: CustomFieldProps) => {
  const { fieldConfig, control, name, t } = props;
  const { placeholderMessage = '' } = fieldConfig?.saveConfig || {};
  const placeholder =
    placeholderMessage || 'CustomExtendedDataField.placeholderText';
  const label = getLabel(fieldConfig);
  return (
    <RenderTextInputField
      control={control}
      name={name}
      labelKey={label}
      placeholderKey={placeholder}
    />
  );
};

const CustomFieldLong = (props: CustomFieldProps) => {
  const { fieldConfig, control, name, t } = props;
  const { placeholderMessage } = fieldConfig?.saveConfig || {};
  const placeholder =
    placeholderMessage || 'CustomExtendedDataField.placeholderLong';
  const label = getLabel(fieldConfig);

  return (
    <RenderTextInputField
      control={control}
      name={name}
      labelKey={label}
      placeholderKey={placeholder}
      onChangeText={(value, onChange) => onChange(Number(value))}
    />
  );
};

const CustomFieldEnum = (props: CustomFieldProps) => {
  const { name, fieldConfig, control } = props;
  const { enumOptions = [], saveConfig } = fieldConfig || {};
  const { placeholderMessage } = saveConfig || {};
  const placeholder =
    placeholderMessage || 'CustomExtendedDataField.placeholderSingleSelect';
  const label = getLabel(fieldConfig);

  return (
    <>
      <RenderDropdownField
        control={control}
        name={name}
        labelField="label"
        valueField="option"
        data={enumOptions}
        placeholderKey={placeholder}
        lableKey={label}
        onDropDownValueChange={(value, cb) => {
          cb(value.option);
        }}
      />
    </>
  );
};

const CustomFieldMultiEnum = (props: CustomFieldProps) => {
  const { name, fieldConfig, control } = props;
  const { enumOptions = [] } = fieldConfig || {};
  const color: AppColors = useColors();
  const label = getLabel(fieldConfig);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <View style={styles.customFieldMultiEnumContainer}>
          <Text style={styles.CustomFieldMultiEnumLable}>{label}</Text>
          <View style={styles.customFieldMultiEnumButtonContainer}>
            {enumOptions.map(elm => {
              const isSelected = value && value.includes(elm.option);
              return (
                <TouchableOpacity
                  key={elm.option}
                  style={[
                    styles.multiEnumButtonItem,
                    isSelected && {
                      backgroundColor: color.marketplaceColor,
                    },
                  ]}
                  onPress={() => {
                    let arr = value ? [...value] : [];
                    const index = arr.findIndex(item => item === elm.option);
                    if (index > -1) {
                      arr = arr.filter(item => item !== elm.option);
                    } else {
                      arr.push(elm.option);
                    }
                    onChange(arr);
                  }}
                >
                  {!isSelected && (
                    <View style={styles.nonSelectedMultiEnumButtonIndicator} />
                  )}
                  <Text
                    style={[
                      styles.multiEnumButtonText,
                      isSelected && { color: colors.white },
                    ]}
                  >
                    {elm.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {error && <Text style={styles.error}>{error.message}</Text>}
        </View>
      )}
    />
  );
};

export const CustomExtendedDataField = ({
  fieldConfig,
  ...rest
}: {
  fieldConfig: FieldConfig;
}) => {
  const { schemaType, enumOptions = [] } = fieldConfig || {};

  switch (schemaType) {
    case SCHEMA_TYPE_ENUM:
      return enumOptions?.length > 0 ? (
        <CustomFieldEnum fieldConfig={fieldConfig} {...rest} />
      ) : null;
    case SCHEMA_TYPE_MULTI_ENUM:
      return enumOptions?.length > 0 ? (
        <CustomFieldMultiEnum fieldConfig={fieldConfig} {...rest} />
      ) : null;
    case SCHEMA_TYPE_TEXT:
      return <CustomFieldText fieldConfig={fieldConfig} {...rest} />;
    case SCHEMA_TYPE_LONG:
      return <CustomFieldLong fieldConfig={fieldConfig} {...rest} />;
    default:
      return <Text>Unknown schema type</Text>;
  }
};

const styles = StyleSheet.create({
  error: {
    marginTop: widthScale(5),
    fontSize: fontScale(14),
    color: colors.error,
  },
  CustomFieldMultiEnumLable: {
    marginBottom: widthScale(16),
    fontWeight: fontWeight.medium,
    fontSize: fontScale(14),
    color: colors.black,
  },
  customFieldMultiEnumContainer: {
    marginBottom: widthScale(20),
    paddingVertical: widthScale(10),
  },
  customFieldMultiEnumButtonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: widthScale(10),
  },
  multiEnumButtonItem: {
    borderRadius: widthScale(12),
  },
  multiEnumButtonText: {
    fontSize: fontScale(14),
    marginVertical: widthScale(8),
    marginHorizontal: widthScale(12),
  },
  nonSelectedMultiEnumButtonIndicator: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    borderRadius: widthScale(12),
    backgroundColor: colors.lightGrey,
  },
});
