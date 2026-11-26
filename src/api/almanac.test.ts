import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getWhatHappenedOnDate, getWeatherOnDate, getSkyOnDate } from './almanac';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function makeFetchResponse(data: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: () => Promise.resolve(data),
  };
}

beforeEach(() => {
  mockFetch.mockReset();
});

// getWhatHappenedOnDate ************************************

describe('getWhatHappenedOnDate', () => {
  it('calls the Wikipedia API with the correct month/day', async () => {
    mockFetch.mockResolvedValue(makeFetchResponse({ events: [], births: [], deaths: [] }));
    await getWhatHappenedOnDate(new Date(2026, 10, 26));
    expect(mockFetch).toHaveBeenCalledWith(
      'https://en.wikipedia.org/api/rest_v1/feed/onthisday/all/11/26',
    );
  });

  it('returns the response on success', async () => {
    const mockData = {
      events: [{ text: 'Some event', year: 1900, pages: [] }],
      births: [{ text: 'Someone born', year: 1850, pages: [] }],
      deaths: [],
    };
    mockFetch.mockResolvedValue(makeFetchResponse(mockData));
    const result = await getWhatHappenedOnDate(new Date(2026, 11, 26));
    expect(result).toEqual(mockData);
  });

  it('throws error when the response is not ok', async () => {
    mockFetch.mockResolvedValue(makeFetchResponse({}, false, 404));
    await expect(getWhatHappenedOnDate(new Date(2026, 11, 26))).rejects.toThrow(
      'HTTP error! status: 404',
    );
  });
});

// getWeatherOnDate ***************************

describe('getWeatherOnDate', () => {
  it('uses the archive URL for past dates', async () => {
    mockFetch.mockResolvedValue(makeFetchResponse({ daily: {} }));
    await getWeatherOnDate(new Date(2020, 0, 1), 42.0683, 19.5126);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('archive-api.open-meteo.com'));
  });

  it('uses the forecast URL for today', async () => {
    mockFetch.mockResolvedValue(makeFetchResponse({ daily: {} }));
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    await getWeatherOnDate(today, 42.0683, 19.5126);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('api.open-meteo.com/v1/forecast'),
    );
  });

  it('uses the forecast URL for future dates', async () => {
    mockFetch.mockResolvedValue(makeFetchResponse({ daily: {} }));
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days from now
    await getWeatherOnDate(futureDate, 42.0683, 19.5126);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('api.open-meteo.com/v1/forecast'),
    );
  });

  it('passes latitude and longitude as query params', async () => {
    mockFetch.mockResolvedValue(makeFetchResponse({ daily: {} }));
    await getWeatherOnDate(new Date(2026, 10, 26), 42.0683, 19.5126);
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('latitude=42.0683'));
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('longitude=19.5126'));
  });

  it('returns the parsed response on success', async () => {
    const mockData = {
      daily: {
        time: ['2020-01-01'],
        temperature_2m_max: [5],
        temperature_2m_min: [1],
        precipitation_sum: [0],
        wind_speed_10m_max: [10],
      },
    };
    mockFetch.mockResolvedValue(makeFetchResponse(mockData));
    const result = await getWeatherOnDate(new Date(2026, 10, 26), 42.0683, 19.5126);
    expect(result).toEqual(mockData);
  });

  it('throws when the response is not ok', async () => {
    mockFetch.mockResolvedValue(makeFetchResponse({}, false, 500));
    await expect(getWeatherOnDate(new Date(2026, 10, 26), 42.0683, 19.5126)).rejects.toThrow(
      'HTTP error! status: 500',
    );
  });
});

// getSkyOnDate ***************************

describe('getSkyOnDate', () => {
  it('formats the date Correctly in the NASA URL', async () => {
    mockFetch.mockResolvedValue(makeFetchResponse({ title: 'Galaxy' }));
    await getSkyOnDate(new Date('2026-11-26T12:00:00Z'));
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('261126'));
  });

  it('includes the NASA API key in the URL', async () => {
    mockFetch.mockResolvedValue(makeFetchResponse({ title: 'Nebula' }));

    await getSkyOnDate(new Date('2026-11-26T12:00:00Z'));

    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('api_key=test-api-key'));
  });

  it('returns the sky data on success', async () => {
    const mockSky = {
      title: 'Galaxies Battle',
      media_type: 'image',
      url: 'https://assets.science.nasa.gov/dynamicimage/assets/science/cds/apod/apod/2026/november/NGC7771group_Marinoni_1179.jpg?w=1179&h=1422&fit=clip',
      explanation: 'After this galaxy battle..',
    };
    mockFetch.mockResolvedValue(makeFetchResponse(mockSky));
    const result = await getSkyOnDate(new Date('2024-06-15T12:00:00Z'));
    expect(result).toEqual(mockSky);
  });

  it('throws when the response is not ok', async () => {
    mockFetch.mockResolvedValue(makeFetchResponse({}, false, 403));
    await expect(getSkyOnDate(new Date('2024-06-15T12:00:00Z'))).rejects.toThrow(
      'HTTP error! status: 403',
    );
  });
});
