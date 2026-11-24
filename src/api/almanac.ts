const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY as string;
if (!NASA_API_KEY) {
    throw new Error('NASA API key is not defined in the environment variables.');
}
export interface WikiPage {
    title: string;
    extract: string;
    thumbnail?: { source: string };
    content_urls: { desktop: { page: string } };
}

export interface WikiEvent {
    text: string;
    year: number;
    pages: WikiPage[];
}

export interface OnThisDayResponse {
    events: WikiEvent[];
    births: WikiEvent[];
}

export interface OpenMeteoDailyResponse {
    latitude: number;
    longitude: number;
    timezone: string;
    daily: {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        precipitation_sum: number[];
        wind_speed_10m_max: number[];
    };
}

export interface NasaSkyData {
    date: string;
    post_id: number;
    title: string;
    permalink: string;
    media_type: 'image' | 'video';
    explanation: string;
    credit: string;
    copyright: string;
    alt: string;
    url: string;
    hdurl?: string;
    basic_html?: string;
    basic_html_url?: string;
}


export async function getWhatHappenedOnDate(date: Date): Promise<OnThisDayResponse> {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/all/${month}/${day}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error: unknown) {
        console.error('Error fetching almanac data:', error);
        throw error;
    }
}

export async function getWeatherOnDate(date: Date, lat: number, long: number): Promise<OpenMeteoDailyResponse> {
    const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: long.toString(),
        start_date: date.toISOString().split('T')[0],
        end_date: date.toISOString().split('T')[0],
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max',
        timezone: 'auto'
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const url = `${date < today
        ? 'https://archive-api.open-meteo.com/v1/archive'
        : 'https://api.open-meteo.com/v1/forecast'}?${params.toString()}`;
    try {
        const response: Response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error: unknown) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}

export async function getSkyOnDate(date: Date): Promise<NasaSkyData | null> {
    const formattedDate = date.toISOString().slice(2, 10).replaceAll('-', '');
    const url = `https://science.nasa.gov/wp-json/wp/v2/apod-basic/${formattedDate}?api_key=${NASA_API_KEY}`;
    console.log('Fetching sky data from URL:', url);
    try {
        const response: Response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error: unknown) {
        console.error('Error fetching sky data:', error);
        throw error;
    }
}