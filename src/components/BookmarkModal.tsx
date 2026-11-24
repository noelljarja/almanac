import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';

interface BookmarkModalProps {
  open: boolean;
  defaultName: string;
  onSave: (name: string) => void;
  onClose: () => void;
}

export default function BookmarkModal({ open, defaultName, onSave, onClose }: BookmarkModalProps) {
  const [name, setName] = useState(defaultName);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setName(defaultName);
  }

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Save Bookmark</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Bookmark name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
          }}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
