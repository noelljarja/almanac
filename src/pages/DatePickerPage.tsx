import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { getSkyOnDate, getWeatherOnDate, getWhatHappenedOnDate, NasaSkyData, OpenMeteoDailyResponse, WikiEvent } from '../api/almanac';
import { Link } from 'react-router-dom';
import { Accordion, AccordionDetails, AccordionSummary, Button } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DOMPurify from 'dompurify';

export default function DatePickerPage() {

  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<WikiEvent[]>([]);
  const [births, setBirths] = useState<WikiEvent[]>([]);
  const [location, setLocation] = useState<{ lat: number; long: number } | null>(null);
  const [weather, setWeather] = useState<OpenMeteoDailyResponse | null>(null);
  const [sky, setSky] = useState<NasaSkyData | null>(null);
  const [eventsLoading, setEventsLoading] = useState<boolean>(true);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);
  const [skyLoading, setSkyLoading] = useState<boolean>(true);

  useEffect(() => {
    setEvents([]);
    setBirths([]);
    setWeather(null);
    setEventsLoading(true);
    setWeatherLoading(true);
    setSkyLoading(true);

    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('User location:', position.coords.latitude, position.coords.longitude);
        setLocation({ lat: position.coords.latitude, long: position.coords.longitude });
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
    getWhatHappenedOnDate(date).then((data) => {
      setEvents(data.events);
      setBirths(data.births);
    }).catch((error: unknown) => {
      console.error('Error fetching almanac data:', error);
      setEventsLoading(false);
    });
    getWeatherOnDate(date, location?.lat ?? 0, location?.long ?? 0).then((data) => {
      setWeather(data);
      setWeatherLoading(false);
    }).catch((error: unknown) => {
      console.error('Error fetching weather data:', error);
      setWeatherLoading(false);
    });
    getSkyOnDate(date).then((data: NasaSkyData | null) => {
      data ? setSky(data[0]) : setSky(null);
      setSkyLoading(false);
    }).catch((error: unknown) => {
      console.error('Error fetching sky data:', error);
      setSkyLoading(false);
    });
  }, [date, location?.lat, location?.long]);


  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          Today is {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Pick a date to see what happened on that day in history.
          <Button className="date-button" variant="outlined" onClick={() => (setDate(new Date(new Date().setDate(new Date().getDate() - 1))))}>
            Switch to yesterday
          </Button>
          <Button className="date-button" variant="outlined" onClick={() => (setDate(new Date(new Date().setDate(new Date().getDate() + 1))))}>
            Switch to tomorrow
          </Button>
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
          <span className="font-bold">Selected</span>: {' '}
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

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                        <Link to={page.content_urls.desktop.page} target="_blank" rel="noopener noreferrer" style={{ color: '#b8501c' }}>
                          {page.title.replace(/_/g, ' ')}
                        </Link>
                      </Typography>
                    ))}
                  </AccordionDetails>
                </Accordion>
              </div>
            ))}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 4 }}>
            What the sky looked like?
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            {sky ? (
              <div>
                {sky.media_type === 'video' ? (
                  <iframe
                    title={sky.title}
                    src={sky.hdurl}
                    width="100%"
                    height="315"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <img src={sky.hdurl} alt={sky.title} style={{ maxWidth: '100%' }} />
                )}
                <Typography className="font-bold" variant="body1" sx={{ mt: 1 }}>
                  {sky.title}
                </Typography>
                {/* Displayed the explanation with sanitized HTML content to prevent XSS attacks */}
                <div class="nasa-section" dangerouslySetInnerHTML={{ __html: sky.explanation ? DOMPurify.sanitize(sky.explanation) : '' }} />
              </div>
            ) : (
              <Typography variant="body1" sx={{ mt: 2 }}>
                Sky data not available.
              </Typography>
            )}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 4 }}>
            What was the weather like?
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            {weather && weather.daily ? (
              <div>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Max Temp: {weather.daily.temperature_2m_max[0]}°C
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Min Temp: {weather.daily.temperature_2m_min[0]}°C
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Precipitation: {weather.daily.precipitation_sum[0]}mm
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Max Wind Speed: {weather.daily.wind_speed_10m_max[0]}m/s
                </Typography>
              </div>
            ) : (
              <Typography variant="body1" sx={{ mt: 2 }}>
                Weather data not available.
              </Typography>
            )}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 4 }}>
            Who was born?
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            {births.map((birth, index) => (
              <div key={index}>
                <Typography variant="body1" sx={{ mt: 2 }}>
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
                        <Link to={page.content_urls.desktop.page} target="_blank" rel="noopener noreferrer" style={{ color: '#b8501c' }}>
                          {page.title.replace(/_/g, ' ')}
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
