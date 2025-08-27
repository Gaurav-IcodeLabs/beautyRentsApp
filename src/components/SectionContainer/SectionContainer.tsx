import React from 'react';
import { ImageBackground, View } from 'react-native';
import { CmsFieldTypes, SectionContainerProps } from '../../appTypes';

const SectionContainer = (props: SectionContainerProps) => {
  const { appearance, children } = props;
  const { fieldType, backgroundImage, backgroundColor } = appearance;
  const bgImage = backgroundImage
    ? appearance?.backgroundImage.attributes.variants.scaled800.url
    : null;

  return (
    <View style={[{ backgroundColor }]}>
      {fieldType === CmsFieldTypes.CUSTOM_APPEARANCE && bgImage ? (
        <ImageBackground source={{ uri: bgImage }} style={{ flex: 1 }}>
          {children}
        </ImageBackground>
      ) : (
        <View>{children}</View>
      )}
    </View>
  );
};

export default SectionContainer;
