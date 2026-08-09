export interface Server {
  id: string;
  country: string;
  countryFa: string;
  city: string;
  cityFa: string;
  flag: string;
  ping: number;
  load: number;
  recommended?: boolean;
}

export const mockServers: Server[] = [
  { id: "de-1", country: "Germany", countryFa: "آلمان", city: "Frankfurt", cityFa: "فرانکفورت", flag: "🇩🇪", ping: 28, load: 32, recommended: true },
  { id: "nl-1", country: "Netherlands", countryFa: "هلند", city: "Amsterdam", cityFa: "آمستردام", flag: "🇳🇱", ping: 31, load: 41 },
  { id: "us-1", country: "United States", countryFa: "ایالات متحده", city: "New York", cityFa: "نیویورک", flag: "🇺🇸", ping: 45, load: 55 },
  { id: "uk-1", country: "United Kingdom", countryFa: "بریتانیا", city: "London", cityFa: "لندن", flag: "🇬🇧", ping: 52, load: 38 },
  { id: "sg-1", country: "Singapore", countryFa: "سنگاپور", city: "Singapore", cityFa: "سنگاپور", flag: "🇸🇬", ping: 98, load: 47 },
  { id: "jp-1", country: "Japan", countryFa: "ژاپن", city: "Tokyo", cityFa: "توکیو", flag: "🇯🇵", ping: 112, load: 29 },
  { id: "fr-1", country: "France", countryFa: "فرانسه", city: "Paris", cityFa: "پاریس", flag: "🇫🇷", ping: 48, load: 36 },
  { id: "ca-1", country: "Canada", countryFa: "کانادا", city: "Toronto", cityFa: "تورنتو", flag: "🇨🇦", ping: 67, load: 44 },
];

export function getRecommended() {
  return mockServers.find((s) => s.recommended) || mockServers[0];
}