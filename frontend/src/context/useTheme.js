import { useContext } from 'react';
import { ThemeContext } from './ThemeContextStore';

export const useTheme = () => useContext(ThemeContext);
