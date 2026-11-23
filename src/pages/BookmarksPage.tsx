import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default function BookmarksPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Bookmarks
      </Typography>
      <Typography color="text.secondary">No bookmarks yet.</Typography>
    </Container>
  );
}
