import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import {
  getSkyOnDate,
  getWeatherOnDate,
  getWhatHappenedOnDate,
  NasaSkyData,
  OpenMeteoDailyResponse,
  WikiEvent,
} from '../api/almanac';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
} from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import DOMPurify from 'dompurify';
import BookmarkModal from '../components/BookmarkModal';
import { saveBookmark } from '../utils/bookmarks';
//Additional import outside requirements for the hash navigation in ids
import { HashLink } from 'react-router-hash-link';

function wikiEventToHtml(event: WikiEvent, type: string, date: Date): string {
  const dateStr = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const links = event.pages
    .map(
      (p) =>
        `<a href="${p.content_urls.desktop.page}" target="_blank" rel="noopener noreferrer">${p.title.replace(/_/g, ' ')}</a>`,
    )
    .join(', ');
  return `<div style="font-family:sans-serif;line-height:1.6">
    <p><strong>${event.year.toString()}</strong>: ${event.text}</p>
    <p>${dateStr}</p>
    ${links ? `<p>Sources: ${links}</p>` : ''}
  </div>`;
}

function weatherToHtml(weather: OpenMeteoDailyResponse, date: Date, place: string | null): string {
  const dateStr = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return `<div style="font-family:sans-serif;line-height:1.8">
    <p><strong>Weather on ${dateStr}${place ? ` in ${place}` : ''}</strong></p>
    <p>Max Temp: ${weather.daily.temperature_2m_max[0].toString()}°C</p>
    <p>Min Temp: ${weather.daily.temperature_2m_min[0].toString()}°C</p>
    <p>Precipitation: ${weather.daily.precipitation_sum[0].toString()}mm</p>
    <p>Max Wind Speed: ${weather.daily.wind_speed_10m_max[0].toString()}m/s</p>
  </div>`;
}

function skyToHtml(sky: NasaSkyData): string {
  const media =
    sky.media_type === 'video'
      ? `<iframe src="${sky.hdurl ?? sky.url}" width="100%" height="315" allowfullscreen></iframe>`
      : `<img src="${sky.hdurl ?? sky.url}" alt="${sky.title}" style="max-width:100%" />`;
  return `<div style="font-family:sans-serif;line-height:1.6">
    ${media}
    <p><strong>${sky.title}</strong></p>
    <p>${sky.explanation}</p>
  </div>`;
}

export default function DatePickerPage() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<WikiEvent[]>([]);
  const [births, setBirths] = useState<WikiEvent[]>([]);
  const [deaths, setDeaths] = useState<WikiEvent[]>([]);
  const [location, setLocation] = useState<{ lat: number; long: number } | null>(null);
  const [weather, setWeather] = useState<OpenMeteoDailyResponse | null>(null);
  const [sky, setSky] = useState<NasaSkyData | null>(null);
  const [eventsLoading, setEventsLoading] = useState<boolean>(true);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);
  const [skyLoading, setSkyLoading] = useState<boolean>(true);
  const [place, setPlace] = useState<string | null>(null);
  const [pendingBookmark, setPendingBookmark] = useState<{
    name: string;
    html: string;
    category: string;
  } | null>(null);

  const openBookmarkModal = (name: string, html: string, category: string) => {
    setPendingBookmark({ name, html, category });
  };

  const handleBookmarkSave = (name: string) => {
    if (!pendingBookmark) return;
    saveBookmark({ name, html: pendingBookmark.html, category: pendingBookmark.category });
    setPendingBookmark(null);
  };

  useEffect(() => {
    if (!location) return;
    const { lat, long } = location;
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat.toString()}&lon=${long.toString()}&zoom=10`,
    )
      .then((res) => res.json())
      .then(
        (data: {
          address?: {
            city?: string;
            town?: string;
            village?: string;
            state?: string;
            country?: string;
          };
        }) => {
          if (data.address) {
            const city: string =
              data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.state ||
              '';
            const country: string = data.address.country ?? '';
            setPlace([city, country].filter(Boolean).join(', '));
          } else {
            setPlace(
              !lat && !long
                ? 'Your location is not available. Please allow location access in your browser settings.'
                : 'Maybe in the ocean?',
            );
          }
        },
      )
      .catch(() => {
        setPlace(
          'Your location is not available. Please allow location access in your browser settings.',
        );
      });
  }, [location]);

  const getLocation = async () => {
    const status = await navigator.permissions.query({ name: 'geolocation' });
    if (status.state !== 'granted') {
      setPlace(
        'Your location is not available. Please allow location access in your browser settings.',
      );
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, long: position.coords.longitude });
      },
      (error) => {
        console.error('Error getting location:', error);
      },
    );
  };

  useEffect(() => {
    setEventsLoading(true);
    setWeatherLoading(true);
    setSkyLoading(true);
    getLocation().catch((error: unknown) => {
      console.error('Error getting location:', error);
    });
    getWhatHappenedOnDate(date)
      .then((data) => {
        setEvents(data.events);
        setBirths(data.births);
        setDeaths(data.deaths);
        setEventsLoading(false);
      })
      .catch((error: unknown) => {
        console.error('Error fetching almanac data:', error);
        setEventsLoading(false);
      });
    getWeatherOnDate(date, location?.lat ?? 0, location?.long ?? 0)
      .then((data) => {
        setWeather(data);
        setWeatherLoading(false);
      })
      .catch((error: unknown) => {
        console.error('Error fetching weather data:', error);
        setWeatherLoading(false);
      });
    getSkyOnDate(date)
      .then((data: NasaSkyData | null) => {
        setSky(data);
        setSkyLoading(false);
      })
      .catch((error: unknown) => {
        console.error('Error fetching sky data:', error);
        setSkyLoading(false);
      });
  }, [date, location?.lat, location?.long]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          Today is{' '}
          {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Typography>
        <Typography variant="h5" component="h3" sx={{ mb: 3 }}>
          Your location: {place}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => {
            void getLocation();
          }}
          sx={{ mb: 3 }}
        >
          Refresh Location
        </Button>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Pick a date to see what happened on that day in history.
        </Typography>
        <Button
          className="date-button"
          variant="outlined"
          sx={{ mb: 2, mt: 2 }}
          onClick={() => {
            setDate(new Date(new Date().setDate(new Date().getDate() - 1)));
          }}
        >
          Switch to yesterday
        </Button>
        <Button
          className="date-button"
          variant="outlined"
          sx={{ mb: 2, mt: 2 }}
          onClick={() => {
            setDate(new Date(new Date().setDate(new Date().getDate() + 1)));
          }}
        >
          Switch to tomorrow
        </Button>

        <TextField
          type="date"
          label="Pick a date"
          sx={{ mb: 2, mt: 2 }}
          value={date.toISOString().split('T')[0]}
          onChange={(e) => {
            setDate(new Date(e.target.value));
          }}
          slotProps={{ inputLabel: { shrink: true } }}
          fullWidth
        />
        <Typography sx={{ mt: 2 }}>
          <span className="font-bold">Selected</span>:{' '}
          {date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Typography>
      </Container>

      <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2, textAlign: 'center' }}>
        On{' '}
        {date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Typography>
      <Stack className="show-on-mobile">
        <Typography variant="body1" sx={{ mt: 2 }}>
          <span className="font-bold">Quick Navigation</span>
        </Typography>
        <HashLink smooth to="#events">
          Events
        </HashLink>
        <HashLink smooth to="#births">
          Births
        </HashLink>
        <HashLink smooth to="#deaths">
          Deaths
        </HashLink>
        <HashLink smooth to="#weather-sky">
          Weather and Sky
        </HashLink>
      </Stack>
      <Grid container spacing={5}>
        {/* Events */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }} id="events">
          <Typography variant="h6" color="text.secondary" sx={{ mt: 4 }}>
            What was happening?
          </Typography>
          {eventsLoading ? (
            <LinearProgress sx={{ mt: 2 }} />
          ) : events.length === 0 ? (
            <Typography variant="body1" sx={{ mt: 2 }}>
              No events found for this date.
            </Typography>
          ) : (
            <Stack sx={{ mt: 2 }}>
              {events.map((event, index) => (
                <Stack key={index}>
                  <Stack direction="row" alignItems="flex-start" spacing={1}>
                    <Typography variant="body1" sx={{ mt: 2, flex: 1 }}>
                      {event.year}: {event.text}
                    </Typography>
                    <Tooltip title="Bookmark this event">
                      <IconButton
                        size="small"
                        sx={{ mt: 1.5 }}
                        onClick={() => {
                          openBookmarkModal(
                            `${event.year.toString()}: ${event.text.substring(0, 50)}`,
                            wikiEventToHtml(event, 'Event', date),
                            'event',
                          );
                        }}
                      >
                        <BookmarkAddIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  <Accordion>
                    <AccordionSummary expandIcon={<ArrowDownwardIcon />}>Sources:</AccordionSummary>
                    <AccordionDetails>
                      {event.pages.map((page, pageIndex) => (
                        <Typography key={pageIndex} variant="body2" sx={{ mt: 1 }}>
                          <Link
                            to={page.content_urls.desktop.page}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#b8501c' }}
                          >
                            {page.title.replace(/_/g, ' ')}
                          </Link>
                        </Typography>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                </Stack>
              ))}
            </Stack>
          )}
        </Grid>

        {/* Births */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }} id="births">
          <Typography variant="h6" color="text.secondary" sx={{ mt: 4 }}>
            Who was born?
          </Typography>
          {eventsLoading ? (
            <LinearProgress color="primary" sx={{ mt: 2 }} />
          ) : births.length === 0 ? (
            <Typography variant="body1" sx={{ mt: 2 }}>
              No births found for this date.
            </Typography>
          ) : (
            <Stack spacing={2} sx={{ mt: 2 }}>
              {births.map((birth, index) => (
                <Stack key={index}>
                  <Stack direction="row" alignItems="flex-start" spacing={1}>
                    <Typography variant="body1" sx={{ mt: 2, flex: 1 }}>
                      <span className="font-bold">{birth.year}</span>: {birth.text}
                    </Typography>
                    <Tooltip title="Bookmark this birth">
                      <IconButton
                        size="small"
                        sx={{ mt: 1.5 }}
                        onClick={() => {
                          openBookmarkModal(
                            `Born ${birth.year.toString()}: ${birth.text.substring(0, 50)}`,
                            wikiEventToHtml(birth, 'Birth', date),
                            'birth',
                          );
                        }}
                      >
                        <BookmarkAddIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  <Accordion>
                    <AccordionSummary expandIcon={<ArrowDownwardIcon />}>Sources:</AccordionSummary>
                    <AccordionDetails>
                      {birth.pages.map((page, pageIndex) => (
                        <Typography key={pageIndex} variant="body2" sx={{ mt: 1 }}>
                          <Link
                            to={page.content_urls.desktop.page}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#b8501c' }}
                          >
                            {page.title.replace(/_/g, ' ')}
                          </Link>
                        </Typography>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                </Stack>
              ))}
            </Stack>
          )}
        </Grid>

        {/* Deaths */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }} id="deaths">
          <Typography variant="h6" color="text.secondary" sx={{ mt: 4 }}>
            Who died?
          </Typography>
          {eventsLoading ? (
            <LinearProgress sx={{ mt: 2 }} />
          ) : deaths.length === 0 ? (
            <Typography variant="body1" sx={{ mt: 2 }}>
              No deaths found for this date.
            </Typography>
          ) : (
            <Stack spacing={2} sx={{ mt: 2 }}>
              {deaths.map((death, index) => (
                <Stack key={index}>
                  <Stack direction="row" alignItems="flex-start" spacing={1}>
                    <Typography variant="body1" sx={{ mt: 2, flex: 1 }}>
                      <span className="font-bold">{death.year}</span>: {death.text}
                    </Typography>
                    <Tooltip title="Bookmark this death">
                      <IconButton
                        size="small"
                        sx={{ mt: 1.5 }}
                        onClick={() => {
                          openBookmarkModal(
                            `Died ${death.year.toString()}: ${death.text.substring(0, 50)}`,
                            wikiEventToHtml(death, 'Death', date),
                            'death',
                          );
                        }}
                      >
                        <BookmarkAddIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  <Accordion>
                    <AccordionSummary expandIcon={<ArrowDownwardIcon />}>Sources:</AccordionSummary>
                    <AccordionDetails>
                      {death.pages.map((page, pageIndex) => (
                        <Typography key={pageIndex} variant="body2" sx={{ mt: 1 }}>
                          <Link
                            to={page.content_urls.desktop.page}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#b8501c' }}
                          >
                            {page.title.replace(/_/g, ' ')}
                          </Link>
                        </Typography>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                </Stack>
              ))}
            </Stack>
          )}
        </Grid>

        {/* Weather & Sky */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }} id="weather-sky">
          <Stack direction="row" alignItems="center" sx={{ mt: 4 }} spacing={1}>
            <Typography variant="h6" color="text.secondary" sx={{ flex: 1 }}>
              {date < new Date() ? 'What was the weather like' : 'What will the weather be like?'}{' '}
              {!location?.lat && !location?.long ? 'in null Island' : ''}?
            </Typography>
            {!weatherLoading && weather?.daily && (
              <Tooltip title="Bookmark the weather">
                <IconButton
                  size="small"
                  onClick={() => {
                    openBookmarkModal(
                      `Weather on ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}${place ? ` in ${place}` : ''}`,
                      weatherToHtml(weather, date, place),
                      'weather',
                    );
                  }}
                >
                  <BookmarkAddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
          {weatherLoading ? (
            <LinearProgress sx={{ mt: 2 }} />
          ) : !weather ? (
            <Typography variant="body1" sx={{ mt: 2 }}>
              Weather data not available.
            </Typography>
          ) : (
            <Stack variant="body1" sx={{ mt: 2 }}>
              <Stack>
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
              </Stack>
            </Stack>
          )}

          <Stack direction="row" alignItems="center" sx={{ mt: 4 }} spacing={1}>
            <Typography variant="h6" color="text.secondary" sx={{ flex: 1 }}>
              {date < new Date() ? 'What did the sky look like?' : 'What will the sky look like?'}
            </Typography>
            {!skyLoading && sky && (
              <Tooltip title="Bookmark the sky">
                <IconButton
                  size="small"
                  onClick={() => {
                    openBookmarkModal(`Sky: ${sky.title}`, skyToHtml(sky), 'sky');
                  }}
                >
                  <BookmarkAddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
          {skyLoading ? (
            <LinearProgress sx={{ mt: 2 }} />
          ) : !sky ? (
            <Typography variant="body1" sx={{ mt: 2 }}>
              Sky data not available.
            </Typography>
          ) : (
            <Stack variant="body1" sx={{ mt: 2 }}>
              <Stack>
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
                <div
                  className="nasa-section"
                  dangerouslySetInnerHTML={{
                    __html: sky.explanation ? DOMPurify.sanitize(sky.explanation) : '',
                  }}
                />
              </Stack>
            </Stack>
          )}
        </Grid>
      </Grid>

      <BookmarkModal
        open={pendingBookmark !== null}
        defaultName={pendingBookmark?.name ?? ''}
        onSave={handleBookmarkSave}
        onClose={() => {
          setPendingBookmark(null);
        }}
      />
    </Container>
  );
}
