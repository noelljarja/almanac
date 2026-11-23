import { useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';

export default function DatePickerPage() {
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date());
  return (
    <Container>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          Today is {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Pick a date to see what happened on that day in history.
        </Typography>
        <TextField
          type="date"
          label="Pick a date"
          value={date.toISOString().split('T')[0]}
          onChange={(e) => { setDate(new Date(e.target.value)); }}
          slotProps={{ inputLabel: { shrink: true } }}
          fullWidth
        />
        {value && (
          <Typography sx={{ mt: 2 }}>
            Selected:{' '}
            {date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
        )}
      </Container>
      <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, textAlign: 'center' }}>
        On {date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })} in history
      </Typography>
      <Grid container spacing={5}>
        <Grid size={3}>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 4 }}>
            What was happening?
          </Typography>
        </Grid>
        <Grid size={3}>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 4 }}>
            What the sky looked like?
          </Typography>
        </Grid>
        <Grid size={3}>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 4 }}>
            What was the weather like?
          </Typography>
        </Grid>
        <Grid size={3}>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 4 }}>
            Who was born?
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
}
