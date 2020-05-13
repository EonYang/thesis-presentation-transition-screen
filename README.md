# Thesis Week Transition Slides

This repository contains an electron app for playing transition slides for your thesis section.

## Setting the contents for your section.

The contents that is read for the slides is located in `./src/studentsData.ts`.

The schedule for each day has been scraped into [./src/schedules](./src/schedules);  To set the content for you slides, copy and paste the corresponding day's schedule from `./src/schedules` into `./src/studentsData.ts`.


## Setting up the Application

```
yarn install
yarn start
// open another ternimal tab/window
yarn run elec
```

Left || right arrow key to navigate between slides.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000/random/0](http://localhost:3000/random/0) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn elec`

This will lunch the electron application. Use this after `yarn start`

This is just a stand alone browser window without toolbar and url bar.
