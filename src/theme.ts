'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'var(--font-roboto)',
  },
  cssVariables: true,

});


export const getTheme = (mode?: string) => {

  return createTheme({
    typography: {
      fontFamily: 'var(--font-roboto)',
    },
    cssVariables: true,
    palette: {
      mode: mode === 'dark' ? 'dark' : 'light'
    }
  });
}

export default theme;
