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

export async function getWhatHappenedOnDate(date: Date): Promise<OnThisDayResponse> {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/all/${month}/${day}`;
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error: unknown) {
        console.error('Error fetching almanac data:', error);
        throw error;
    }
}

export async function getWeatherOnDate(date: Date, lat: number, long: number): Promise<any> {
    //TODO : Implement weather fetching logic based on date and location + gather location data from user in datepicker
}