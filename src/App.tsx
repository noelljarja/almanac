import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import DatePickerPage from './pages/DatePickerPage';
import BookmarksPage from './pages/BookmarksPage';
import IconButton from '@mui/material/IconButton';
import { Toolbar } from '@mui/material';
import { Home as HomeIcon, Bookmark as BookmarkIcon } from '@mui/icons-material';
export default function App() {
  return (
    <BrowserRouter>
      <AppBar sx={{ bgcolor: '#b8501c' }} position="static">
          <Toolbar>
          <IconButton  disableRipple component={NavLink} to="/">
            <span className="labeled-button"><HomeIcon /><span className="labeled-button-text">Almanac</span></span>
          </IconButton>
          <IconButton  disableRipple component={NavLink} to="/bookmarks">
            <span className="labeled-button"><BookmarkIcon /><span className="labeled-button-text">Bookmark</span></span>
          </IconButton>
          </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/" element={<DatePickerPage />} />
        <Route path="/bookmarks" element={<BookmarksPage />} />
      </Routes>
    </BrowserRouter>
  );
}
