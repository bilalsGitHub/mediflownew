// Color palette definitions for the application

export type ThemeId = 'light' | 'dark';

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  colors: {
    background: string;
    primary: string;
    primaryLight: string;
    primaryDark: string;
    textDark: string;
    textSecondary: string;
    accent: string;
    accentLight?: string;
    danger: string;
    cardBg?: string;
    border?: string;
    // Status colors
    success?: string;
    successLight?: string;
    warning?: string;
    warningLight?: string;
    info?: string;
    infoLight?: string;
    neutral?: string;
    // Gray scale (3+ levels)
    grayBg?: string;
    grayCard?: string;
    grayBorder?: string;
  };
}

export const themes: Record<ThemeId, Theme> = {
  'light': {
    id: 'light',
    name: 'Hell',
    description: 'Heller Modus',
    colors: {
      background: '#FFFFFF',
      primary: '#2563EB',
      primaryLight: '#EFF6FF',
      primaryDark: '#1E40AF',
      textDark: '#1F2937',
      textSecondary: '#6B7280',
      accent: '#1E8E5A', // Daha koyu ve desatüre yeşil
      accentLight: '#D1FAE5',
      danger: '#DC2626',
      cardBg: '#F7F9FB', // Daha açık gri arka plan
      border: '#E3E7ED', // Daha belirgin border
      // Professional status colors
      success: '#1E8E5A', // Koyu, desatüre yeşil (sadece aktif/başarı için)
      successLight: '#E6F7F0', // Çok açık yeşil tint
      warning: '#F59E0B', // Soft amber
      warningLight: '#FEF3C7', // Çok açık sarı tint
      info: '#3B82F6', // Soft blue
      infoLight: '#DBEAFE', // Çok açık mavi tint
      neutral: '#6B7280', // Soft gray
      // Gray scale (3+ levels)
      grayBg: '#F7F9FB', // Arka plan
      grayCard: '#FFFFFF', // Kart yüzeyi
      grayBorder: '#E3E7ED', // Border / divider
    },
  },
  'dark': {
    id: 'dark',
    name: 'Dunkel',
    description: 'Dunkler Modus',
    colors: {
      background: '#0F172A',
      primary: '#3B82F6',
      primaryLight: '#1E3A8A',
      primaryDark: '#1E40AF',
      textDark: '#F1F5F9',
      textSecondary: '#94A3B8',
      accent: '#1E8E5A', // Koyu, desatüre yeşil (light ile aynı)
      accentLight: '#16A34A',
      danger: '#F87171',
      cardBg: '#1E293B',
      border: '#334155',
      // Professional status colors
      success: '#1E8E5A', // Koyu, desatüre yeşil
      successLight: '#1E3A2E', // Koyu yeşil tint
      warning: '#FBBF24', // Soft amber
      warningLight: '#3E2E1E', // Koyu sarı tint
      info: '#60A5FA', // Soft blue
      infoLight: '#1E3A5A', // Koyu mavi tint
      neutral: '#94A3B8', // Soft gray
      // Gray scale (3+ levels)
      grayBg: '#0F172A', // Arka plan
      grayCard: '#1E293B', // Kart yüzeyi
      grayBorder: '#334155', // Border / divider
    },
  },
};

export const defaultTheme: ThemeId = 'light';

