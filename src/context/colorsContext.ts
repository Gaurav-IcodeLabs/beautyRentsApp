import { createContext, useContext } from 'react';
// import { Colors } from '../appTypes'
import { AppColors, colors } from '../theme';

// export const ColorsContext = createContext({})
export const ColorsContext = createContext<AppColors>(colors);

export const ColorsProvider = ColorsContext.Provider;

export const useColors = () => {
  return useContext(ColorsContext);
};
