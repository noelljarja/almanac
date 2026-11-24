import { useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import {
  List,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DOMPurify from 'dompurify';
import { getBookmarks, deleteBookmark, Bookmark } from '../utils/bookmarks';

const CATEGORY_COLORS: Record<
  string,
  'default' | 'primary' | 'birth' | 'death' | 'weather' | 'sky'
> = {
  event: 'primary',
  birth: 'birth',
  death: 'death',
  weather: 'weather',
  sky: 'sky',
};

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => getBookmarks());
  const [selected, setSelected] = useState<Bookmark | null>(null);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteBookmark(id);
    setBookmarks(getBookmarks());
    if (selected?.id === id) setSelected(null);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Bookmarks
      </Typography>

      {bookmarks.length === 0 ? (
        <Typography color="text.secondary">No bookmarks yet.</Typography>
      ) : (
        <List disablePadding>
          {bookmarks.map((bookmark, index) => (
            <span key={bookmark.id}>
              <ListItemButton
                onClick={() => {
                  setSelected(bookmark);
                }}
                sx={{ pr: 7 }}
              >
                <ListItemText
                  primary={bookmark.name}
                  secondary={
                    <Chip
                      label={bookmark.category.charAt(0).toUpperCase() + bookmark.category.slice(1)}
                      color={CATEGORY_COLORS[bookmark.category] ?? 'default'}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={(e) => {
                      handleDelete(bookmark.id, e);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItemButton>
              {index < bookmarks.length - 1 && <Divider />}
            </span>
          ))}
        </List>
      )}

      <Dialog
        open={selected !== null}
        onClose={() => {
          setSelected(null);
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{selected?.name}</DialogTitle>
        <DialogContent dividers>
          <div
            dangerouslySetInnerHTML={{
              __html: selected
                ? DOMPurify.sanitize(selected.html, { ADD_ATTR: ['target', 'allowfullscreen'] })
                : '',
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setSelected(null);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
