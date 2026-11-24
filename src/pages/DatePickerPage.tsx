import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { getWhatHappenedOnDate, WikiEvent } from '../api/almanac';
import { Link } from 'react-router-dom';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export default function DatePickerPage() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<WikiEvent[]>([]);
  const [births, setBirths] = useState<WikiEvent[]>([]);
  useEffect(() => {
    getWhatHappenedOnDate(date).then((data) => {
      setEvents(data.events);
      setBirths(data.births);
    }).catch((error: unknown) => {
      console.error('Error fetching almanac data:', error);
    });
  }, []);
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
          <Typography sx={{ mt: 2 }}>
            Selected:{' '}
            {date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
      </Container>
      <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, textAlign: 'center' }}>
        On {date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })} in history
      </Typography>
      <Grid container spacing={5}>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 4 }}>
            What was happening?
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            {events.map((event, index) => (
              <div key={index}>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {event.year}: {event.text}
                </Typography>
                <Accordion>
                  <AccordionSummary 
                  expandIcon={<ArrowDownwardIcon />}>
                      Sources:
                  </AccordionSummary>
                  <AccordionDetails>
                    {event.pages.map((page, pageIndex) => (
                      <Typography key={pageIndex} variant="body2" sx={{ mt: 1 }}>
                        <Link to={page.content_urls.desktop.page} target="_blank" rel="noopener noreferrer">
                        {page.title}
                      </Link>
                    </Typography>
                  ))}
                  </AccordionDetails>
                </Accordion>
              </div>
            ))}
          </Typography>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 4 }}>
            What the sky looked like?
          </Typography>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 4 }}>
            What was the weather like?
          </Typography>
        </Grid>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 4 }}>
            Who was born?
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            {births.map((birth, index) => (
              <div key={index}>
                <Typography variant="body1" sx={{ mt: 2}}>
                  <span className="font-bold"> {birth.year} </span>: {birth.text}
                </Typography>
                <Accordion>
                  <AccordionSummary 
                  expandIcon={<ArrowDownwardIcon />}>
                      Sources:
                  </AccordionSummary>
                  <AccordionDetails>
                    {birth.pages.map((page, pageIndex) => (
                      <Typography key={pageIndex} variant="body2" sx={{ mt: 1 }}>
                        <Link to={page.content_urls.desktop.page} target="_blank" rel="noopener noreferrer">
                        {page.title}
                      </Link>
                    </Typography>
                  ))}
                  </AccordionDetails>
                </Accordion>
              </div>
            ))}
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
}
