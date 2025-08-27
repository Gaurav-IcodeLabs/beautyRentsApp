import { BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import React from 'react'

export const RenderBackdrop = (props: any) => (
  <BottomSheetBackdrop
    {...props}
    disappearsOnIndex={-1}
    appearsOnIndex={0}
    opacity={0.5}
  />
)
