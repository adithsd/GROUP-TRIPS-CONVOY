import { WeatherCondition } from '../types';

class WeatherService {
  public getWeatherForLocation(lat: number, lng: number, isTrek: boolean = false): WeatherCondition {
    // Generate realistic microclimate based on latitude/longitude elevation
    if (isTrek || lat > 37.5) {
      return {
        tempCelsius: 14,
        condition: 'Mountain Fog',
        windSpeedKmh: 32,
        windDirection: 'WNW',
        visibilityKm: 8.5,
        alert: 'Summit Crosswinds 32 km/h • Sudden Temperature Drop Above 2,400m'
      };
    }

    return {
      tempCelsius: 22,
      condition: 'Clear',
      windSpeedKmh: 18,
      windDirection: 'NW',
      visibilityKm: 25,
      alert: undefined
    };
  }
}

export const weatherService = new WeatherService();
