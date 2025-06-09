import { WeatherCondition, WeatherForecast } from '@/types';

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1';
const TUNISIA_TIMEZONE = 'Africa/Tunis';

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
    relative_humidity_2m: string;
    apparent_temperature: string;
    is_day: string;
    precipitation: string;
    rain: string;
    showers: string;
    snowfall: string;
    weather_code: string;
    cloud_cover: string;
    pressure_msl: string;
    surface_pressure: string;
    wind_speed_10m: string;
    wind_direction_10m: string;
    wind_gusts_10m: string;
  };
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    rain: number;
    showers: number;
    snowfall: number;
    weather_code: number;
    cloud_cover: number;
    pressure_msl: number;
    surface_pressure: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
  };
  daily_units: {
    time: string;
    weather_code: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
    apparent_temperature_max: string;
    apparent_temperature_min: string;
    sunrise: string;
    sunset: string;
    daylight_duration: string;
    sunshine_duration: string;
    uv_index_max: string;
    uv_index_clear_sky_max: string;
    precipitation_sum: string;
    rain_sum: string;
    showers_sum: string;
    snowfall_sum: string;
    precipitation_hours: string;
    precipitation_probability_max: string;
    wind_speed_10m_max: string;
    wind_gusts_10m_max: string;
    wind_direction_10m_dominant: string;
    shortwave_radiation_sum: string;
    et0_fao_evapotranspiration: string;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    apparent_temperature_max: number[];
    apparent_temperature_min: number[];
    sunrise: string[];
    sunset: string[];
    daylight_duration: number[];
    sunshine_duration: number[];
    uv_index_max: number[];
    uv_index_clear_sky_max: number[];
    precipitation_sum: number[];
    rain_sum: number[];
    showers_sum: number[];
    snowfall_sum: number[];
    precipitation_hours: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    wind_gusts_10m_max: number[];
    wind_direction_10m_dominant: number[];
    shortwave_radiation_sum: number[];
    et0_fao_evapotranspiration: number[];
  };
}

const mapWeatherCode = (code: number, isDay: boolean = true): WeatherCondition => {
  switch (code) {
    case 0:
      return WeatherCondition.SUNNY;
    case 1:
    case 2:
      return WeatherCondition.PARTLY_CLOUDY;
    case 3:
      return WeatherCondition.CLOUDY;
    case 45:
    case 48:
      return WeatherCondition.FOG;
    case 51:
    case 53:
    case 55:
      return WeatherCondition.DRIZZLE;
    case 61:
    case 63:
    case 65:
    case 80:
    case 81:
    case 82:
      return WeatherCondition.RAIN;
    case 71:
    case 73:
    case 75:
    case 85:
    case 86:
      return WeatherCondition.SNOW;
    case 95:
    case 96:
    case 99:
      return WeatherCondition.STORM;
    default:
      return isDay ? WeatherCondition.SUNNY : WeatherCondition.CLOUDY;
  }
};

export const getWeatherData = async (latitude: number, longitude: number): Promise<{
  current: WeatherForecast;
  forecast: WeatherForecast[];
}> => {
  try {
    const url = `${OPEN_METEO_BASE_URL}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=${TUNISIA_TIMEZONE}&forecast_days=7`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    
    const data: OpenMeteoResponse = await response.json();
    
    // Create current weather
    const current: WeatherForecast = {
      id: 'current',
      date: data.current.time,
      temperature: {
        min: data.daily.temperature_2m_min[0],
        max: data.daily.temperature_2m_max[0],
        current: data.current.temperature_2m,
        unit: '°C'
      },
      humidity: data.current.relative_humidity_2m,
      precipitation: {
        probability: data.daily.precipitation_probability_max[0] || 0,
        amount: data.current.precipitation,
        unit: 'mm'
      },
      windSpeed: data.current.wind_speed_10m,
      condition: mapWeatherCode(data.current.weather_code, data.current.is_day === 1)
    };
    
    // Create forecast
    const forecast: WeatherForecast[] = data.daily.time.slice(1).map((date, index) => ({
      id: `forecast-${index}`,
      date,
      temperature: {
        min: data.daily.temperature_2m_min[index + 1],
        max: data.daily.temperature_2m_max[index + 1],
        unit: '°C'
      },
      humidity: data.current.relative_humidity_2m,
      precipitation: {
        probability: data.daily.precipitation_probability_max[index + 1] || 0,
        amount: data.daily.precipitation_sum[index + 1],
        unit: 'mm'
      },
      windSpeed: data.daily.wind_speed_10m_max[index + 1],
      condition: mapWeatherCode(data.daily.weather_code[index + 1])
    }));
    
    return { current, forecast };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

export const getHistoricalWeatherData = async (
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string
): Promise<Array<{
  date: string;
  temperature: number;
  humidity: number;
  precipitation: number;
}>> => {
  try {
    const url = `${OPEN_METEO_BASE_URL}/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_mean,relative_humidity_2m_mean,precipitation_sum&timezone=${TUNISIA_TIMEZONE}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch historical weather data');
    }
    
    const data = await response.json();
    
    return data.daily.time.map((date: string, index: number) => ({
      date: new Date(date).toLocaleDateString('en-US', { 
        timeZone: TUNISIA_TIMEZONE,
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      temperature: data.daily.temperature_2m_mean[index],
      humidity: data.daily.relative_humidity_2m_mean[index],
      precipitation: data.daily.precipitation_sum[index]
    }));
  } catch (error) {
    console.error('Error fetching historical weather data:', error);
    throw error;
  }
};

// Function to get user's location-based weather
export const getUserLocationWeather = async (): Promise<{
  current: WeatherForecast;
  forecast: WeatherForecast[];
} | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const weatherData = await getWeatherData(latitude, longitude);
          resolve(weatherData);
        } catch (error) {
          console.error('Error fetching location-based weather:', error);
          resolve(null);
        }
      },
      (error) => {
        console.warn('Could not get location for weather:', error);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  });
};

// Function to format date in Tunisia timezone
export const formatDateTunisia = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    timeZone: TUNISIA_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTimeTunisia = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('en-US', {
    timeZone: TUNISIA_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit'
  });
};
