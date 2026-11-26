# Almanac Setup

## How to use

Clone repository
Replace .env-example with .env and set the api key from NASA API

Install it and run locally:

```bash
npm install
npm run dev
```

## Usage with docker

Replace .env-example with .env and set the api key from [NASA API](https://api.nasa.gov/)

Run `docker compose up`

## Code Explanation

Project was started using the template from Material UI [MUI Tailwind CSS + Vite](https://github.com/mui/material-ui/tree/v9.x/examples/material-ui-vite-ts)
Unnecessary code was removed and kept what was necessary for the project.

### Folder structure

Folders are separated like this, in the main src directory, all main configuration of the app is set. Inside pages are the two pages, datepicker which works as the homescreen and shows the whole grid and bookmark which shows the stored bookmarks. Api is the folder which contains the configuration to call the apis, together with the error handling. Components is for shared components, which can be used by multiple pages, and in our case it is the Bookmark Modal, which can also be used in future pages in case something else needs to be bookmarked. Utils keeps the bookmark configuration, how they are shown, saved and deleted. All storage runs through session storage. In the main app folder we have main configs, like docker file, environment configuration, prettier and eslint configs, git configs etc.

### APIs

I have used in the project all the APIs mentioned in the assignment. The only difference is with the NASA APOD, since the api was being removed in december so I used the newer version [NASA API](https://science.nasa.gov/wp-json/wp/v2/apod-basic/).\\

The error handling in the APIs is pretty basic, the errors are thrown by the api to the pages, where they are only logged in the console, which is fairly limited (this is the **first limitation** on the app, not because of time, but since it was not clearly defined and for demo purposes, I just made a quick solution), but I did it this way for this demo, not logging it internally in a logger or providing more customization, like checking based on status of the response what to show to the end user. For now the loading spinner is cleared and the data is left as empty, so the app keeps working and the screen shows No data available for the specific calls.\\

The APIs function are simply calling the APIs, the first **getWhatHappenedOnDate** receives all from Wikipedia on a specific date and returns it to the page, which is then processed to be separated in events, births and death. The second **getWeatherOnDate** receives date and user location to make the api call. The difference here is that the date must be checked, so that dates before today go to the archive url and the others go to forecasted dates. This is also handled in the DatePickerPage to show the correct string depending on the date. In a similar way works also **getSkyOnDate**. It expects the date formated as a string without the separator -. In the DatePickerPage here the string is also modified to show correctly, even though Nasa does not publish future images, but instead of showing empty the last information received from API is shown.\\

### General app functionality

I want to start here with the app theme, main color of the app is something familiar to you, because I use the same color as Motu Novu main color. Others colors are just needed for the tags/chips in Bookmark. **Extra packages installed outside MUI** are **DomPurify**, which removes script tags from the innerHTML which is vulnerable to cross side scripting, so therefore the html content is cleaned up. The other package is **react-router-hash-link**, which is necessary for the mobile ID navigation in the DatePicker, since the grid layout is very big on mobile and it is easier to navigate with links, but React does not directly support that. In the index.css there are some general CSS configs, some are with !important to overwrite themes existing configs, and some are set just to modify the display of the elements on some cases where I found it better to use a general class or not write everything in the component. \\

The app main page is DatePicker, there the user is presented with the results of the events, births, deaths, weather and sky image with description. Here the user can change quickly the day to previous and next date, location is also required since it is needed for the weather so that it shows the weather based on user location. Optional extra here which can be added would be the user to be able to select a city or state and load the weather for it. When the user is located in lat 0 and lon 0 the weather shows the Weather for the Null Island (programmer joke). Loading animations are in place when the data is being loaded. There is also the bookmark functionality which calls the Modal with the category of bookmark and the title. After saving it, we can go to the Bookmark page to be able to open them in a modal, or delete them. All data is stored in session storage and persists in the user session.\\

This summary explains how the app generally works and below I will add the details for each file separately.

#### The basics

app.tsx -> Used for the routing, connects the two pages DatePicker and Bookmarks\
main.tsx -> Main app config and theme. Also strict mode which catches early bugs and re-renders on development\
mui.d.ts -> Typescript declaration file for the theme settings to allow using birth, death etc.. as names without triggering a type error\
vite-env.d.ts -> Helps vite deal with env files

#### The fun-part

src/ : \
utils/bookmarks.ts -> Full configuration of the bookmarks, save, delete and interface\
pages/BookmarksPage.tsx -> Loads bookmarks from session storage and displays them in a list together with their category. On Click they can be opened and see what is stored and in the list they also have a delete button.\
pages/DatePicerPage.tsx-> The page displays current date, location and two buttons for switching to the next or previous date, plus the datepicker for dates way before or further in the future. Below that it displays in a grid all the event for the date, like birth, death, events, weather and sky, each entry accompanied by a button which calls the Bookmark Modal to save the bookmark, with the title of the event. The app requesting the location and grabbing it from the page, then from the current date getting the results for the events and so on. On date change the request are re-made and displayed with a loading bar. All api calls are inside UseEffect(); so that they load and don't interfer with the rendering plus they detect the date change and request correct data.\
components/BookMarkModal.tsx -> simple modal with save and cancel button and onsave callback which gets a function from the screen on how to save the data.\
api/almanac.ts->Api Calls for each request with simple error handling plus interfaces necessary for the response types.

#### Docker setup

Simple docker setup for vite. It required the API Key to be set in the .env and loads directly with composer up. The deployment is in production mode hence the nginx config. The app is built and shown through the container.

#### Le Tests

I created some sample tests, mostly for the API, since I thought it is something that is worth testing. Sometimes APIs get updated and therefore tests should be the source of truth on changes.\\

They can be run with

```bash
npm run test
```

\\
The tests are quite simple for the APIs in general, here is the Wiki API:\

First test tries if the function is putting date correctly in the URL\
Second test compares it to a mock result if the api returns the response on success\
Third test tests if an error is thrown on 404.\\

For Weather API:\\

The 3 first tests see depending on the date if the archive, forecast or future date is called correctly.\
The 4th test if latitude and longitude is passed correctly to the API\
The last two are similar to Wiki API\\

For NASA API: \\
First test checks if the date is set correctly, the second checks the API, third and fourth are similar to other APIs

As it is also shown in code, the error codes for each API change. The idea is we can lookup other error codes as well and we can check them out, but since we would get same results I just left it as a demo there, to see that it works for different status codes as well. Other test could also be implemented to check other error codes, but I think it is clear for this demo.
