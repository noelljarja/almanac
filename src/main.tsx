import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './index.css';
import App from './App.tsx';

const theme = createTheme({
  palette: {
    primary: {
      main: '#b8501c',
    },
    birth: {
      main: '#6a806b',
      contrastText: '#ffffff',
    },
    death: {
      main: '#2b0404',
      contrastText: '#ffffff',
    },
    sky: {
      main: '#5d0371',
      contrastText: '#ffffff',
    },
    weather: {
      main: '#618eff',
      contrastText: '#ffffff',
    },
  },
});

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
