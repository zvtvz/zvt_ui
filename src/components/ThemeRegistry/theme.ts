import { extendTheme } from '@mui/joy/styles';
import { Inter, Source_Code_Pro } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  adjustFontFallback: false, // prevent NextJS from adding its own fallback font
  fallback: ['var(--joy-fontFamily-fallback)'], // use Joy UI's fallback font
  display: 'swap',
});

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  adjustFontFallback: false, // prevent NextJS from adding its own fallback font
  fallback: [
    // the default theme's fallback for monospace fonts
    'ui-monospace',
    'SFMono-Regular',
    'Menlo',
    'Monaco',
    'Consolas',
    'Liberation Mono',
    'Courier New',
    'monospace',
  ],
  display: 'swap',
});

const palette = {
  primary: {
    solidBg: '#0d6efd',
    solidHoverBg: '#0b5ed7',
    solidActiveBg: '#0a58ca',
  },
};

const theme = extendTheme({
  fontFamily: {
    body: inter.style.fontFamily,
    display: inter.style.fontFamily,
    code: sourceCodePro.style.fontFamily,
  },
  colorSchemes: {
    light: { palette },
  },
  components: {
    JoyButton: {
      // styleOverrides: {
      //   root: ({ ownerState }) => ({
      //     ...(ownerState.color === 'primary' && {
      //       backgroundColor: '#4338ca',
      //     }),
      //   }),
      // },
    },
  },
});

export default theme;
