export type WeatherImagesObject = {
  code: number;
  descDay: string;
  descNight: string;
  iconCode: number;
  daySrc: any;
  nightSrc: any;
};

export const WEATHER_IMAGES: WeatherImagesObject[] = [
  {
    code: 0,
    descDay: 'Sunny',
    descNight: 'Clear',
    iconCode: 113,
    daySrc: require('./64x64/day/113.png'),
    nightSrc: require('./64x64/night/113.png'),
  },
  {
    code: 1,
    descDay: 'Partly cloudy',
    descNight: 'Partly cloudy',
    iconCode: 116,
    daySrc: require('./64x64/day/116.png'),
    nightSrc: require('./64x64/night/116.png'),
  },
  {
    code: 2,
    descDay: 'Cloudy',
    descNight: 'Cloudy',
    iconCode: 119,
    daySrc: require('./64x64/day/119.png'),
    nightSrc: require('./64x64/night/119.png'),
  },
  {
    code: 3,
    descDay: 'Overcast',
    descNight: 'Overcast',
    iconCode: 122,
    daySrc: require('./64x64/day/122.png'),
    nightSrc: require('./64x64/night/122.png'),
  },
  {
    code: 45,
    descDay: 'Fog',
    descNight: 'Fog',
    iconCode: 248,
    daySrc: require('./64x64/day/248.png'),
    nightSrc: require('./64x64/night/248.png'),
  },
  {
    code: 48,
    descDay: 'Freezing fog',
    descNight: 'Freezing fog',
    iconCode: 260,
    daySrc: require('./64x64/day/260.png'),
    nightSrc: require('./64x64/night/260.png'),
  },
  {
    code: 51,
    descDay: 'Patchy light drizzle',
    descNight: 'Patchy light drizzle',
    iconCode: 263,
    daySrc: require('./64x64/day/263.png'),
    nightSrc: require('./64x64/night/263.png'),
  },
  {
    code: 53,
    descDay: 'Light drizzle',
    descNight: 'Light drizzle',
    iconCode: 266,
    daySrc: require('./64x64/day/266.png'),
    nightSrc: require('./64x64/night/266.png'),
  },
  {
    code: 56,
    descDay: 'Freezing drizzle',
    descNight: 'Freezing drizzle',
    iconCode: 281,
    daySrc: require('./64x64/day/281.png'),
    nightSrc: require('./64x64/night/281.png'),
  },
  {
    code: 57,
    descDay: 'Heavy freezing drizzle',
    descNight: 'Heavy freezing drizzle',
    iconCode: 284,
    daySrc: require('./64x64/day/284.png'),
    nightSrc: require('./64x64/night/284.png'),
  },
  {
    code: 55,
    descDay: 'Patchy light rain',
    descNight: 'Patchy light rain',
    iconCode: 293,
    daySrc: require('./64x64/day/293.png'),
    nightSrc: require('./64x64/night/293.png'),
  },
  {
    code: 61,
    descDay: 'Light rain',
    descNight: 'Light rain',
    iconCode: 296,
    daySrc: require('./64x64/day/296.png'),
    nightSrc: require('./64x64/night/296.png'),
  },
  {
    code: 63,
    descDay: 'Moderate rain',
    descNight: 'Moderate rain',
    iconCode: 302,
    daySrc: require('./64x64/day/302.png'),
    nightSrc: require('./64x64/night/302.png'),
  },
  {
    code: 65,
    descDay: 'Heavy rain',
    descNight: 'Heavy rain',
    iconCode: 308,
    daySrc: require('./64x64/day/308.png'),
    nightSrc: require('./64x64/night/308.png'),
  },
  {
    code: 66,
    descDay: 'Light freezing rain',
    descNight: 'Light freezing rain',
    iconCode: 311,
    daySrc: require('./64x64/day/311.png'),
    nightSrc: require('./64x64/night/311.png'),
  },
  {
    code: 67,
    descDay: 'Moderate or heavy freezing rain',
    descNight: 'Moderate or heavy freezing rain',
    iconCode: 314,
    daySrc: require('./64x64/day/314.png'),
    nightSrc: require('./64x64/night/314.png'),
  },
  {
    code: 71,
    descDay: 'Light snow',
    descNight: 'Light snow',
    iconCode: 326,
    daySrc: require('./64x64/day/326.png'),
    nightSrc: require('./64x64/night/326.png'),
  },
  {
    code: 73,
    descDay: 'Moderate snow',
    descNight: 'Moderate snow',
    iconCode: 332,
    daySrc: require('./64x64/day/332.png'),
    nightSrc: require('./64x64/night/332.png'),
  },
  {
    code: 75,
    descDay: 'Heavy snow',
    descNight: 'Heavy snow',
    iconCode: 338,
    daySrc: require('./64x64/day/338.png'),
    nightSrc: require('./64x64/night/338.png'),
  },
  {
    code: 77,
    descDay: 'Ice pellets',
    descNight: 'Ice pellets',
    iconCode: 350,
    daySrc: require('./64x64/day/350.png'),
    nightSrc: require('./64x64/night/350.png'),
  },
  {
    code: 80,
    descDay: 'Light rain shower',
    descNight: 'Light rain shower',
    iconCode: 353,
    daySrc: require('./64x64/day/353.png'),
    nightSrc: require('./64x64/night/353.png'),
  },
  // Modified text
  {
    code: 81,
    descDay: 'Moderate rain shower',
    descNight: 'Moderate rain shower',
    iconCode: 356,
    daySrc: require('./64x64/day/356.png'),
    nightSrc: require('./64x64/night/356.png'),
  },
  // Modified text
  {
    code: 82,
    descDay: 'Heavy rain shower',
    descNight: 'Heavy rain shower',
    iconCode: 359,
    daySrc: require('./64x64/day/359.png'),
    nightSrc: require('./64x64/night/359.png'),
  },
  {
    code: 85,
    descDay: 'Light snow showers',
    descNight: 'Light snow showers',
    iconCode: 368,
    daySrc: require('./64x64/day/368.png'),
    nightSrc: require('./64x64/night/368.png'),
  },
  // Mismatch
  {
    code: 86,
    descDay: 'Moderate or heavy snow showers',
    descNight: 'Moderate or heavy snow showers',
    iconCode: 371,
    daySrc: require('./64x64/day/371.png'),
    nightSrc: require('./64x64/night/371.png'),
  },
  {
    code: 95,
    descDay: 'Moderate or heavy rain with thunder',
    descNight: 'Moderate or heavy rain with thunder',
    iconCode: 389,
    daySrc: require('./64x64/day/389.png'),
    nightSrc: require('./64x64/night/389.png'),
  },
  // Mismatch
  {
    code: 96,
    descDay: 'Patchy light snow with thunder',
    descNight: 'Patchy light snow with thunder',
    iconCode: 392,
    daySrc: require('./64x64/day/392.png'),
    nightSrc: require('./64x64/night/392.png'),
  },
  // Mismatch
  {
    code: 99,
    descDay: 'Moderate or heavy snow with thunder',
    descNight: 'Moderate or heavy snow with thunder',
    iconCode: 395,
    daySrc: require('./64x64/day/395.png'),
    nightSrc: require('./64x64/night/395.png'),
  },
];
