import '@mui/material/styles';
import '@mui/material/Chip';

declare module '@mui/material/styles' {
  interface Palette {
    birth: Palette['primary'];
    death: Palette['primary'];
    sky: Palette['primary'];
    weather: Palette['primary'];
  }
  interface PaletteOptions {
    birth?: PaletteOptions['primary'];
    death?: PaletteOptions['primary'];
    sky?: PaletteOptions['primary'];
    weather?: PaletteOptions['primary'];
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    birth: true;
    death: true;
    sky: true;
    weather: true;
  }
}
