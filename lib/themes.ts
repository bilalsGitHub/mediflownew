// Color palette definitions for the application
// 6 Base Colors × 6 Themes = 36 Total Colors

export type ThemeId = 'light' | 'dark' | 'medical' | 'premium' | 'ocean' | 'forest';

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  colors: {
    // Base colors
    background: string;
    text: string;
    textSecondary: string;
    card: string;
    border: string;
    
    // 6 Core Action Colors
    primary: string;           // Main actions (Save, Submit, Complete)
    primaryHover: string;
    primaryLight: string;
    
    secondary: string;         // AI/Premium features
    secondaryHover: string;
    secondaryLight: string;
    
    accent: string;            // Highlights & emphasis
    accentHover: string;
    accentLight: string;
    
    success: string;           // Success states
    successHover: string;
    successLight: string;
    
    warning: string;           // Warning states
    warningHover: string;
    warningLight: string;
    
    danger: string;            // Danger actions
    dangerHover: string;
    dangerLight: string;
    
    // Neutral/Gray tones
    neutral: string;
    neutralHover: string;
  };
}

export const themes: Record<ThemeId, Theme> = {
  // 1. LIGHT THEME - Clean & Professional
  'light': {
    id: 'light',
    name: 'Hell',
    description: 'Heller professioneller Modus',
    colors: {
      background: '#FFFFFF',
      text: '#0F172A',
      textSecondary: '#64748B',
      card: '#F8FAFC',
      border: '#E2E8F0',
      
      // Primary - Green (Medical)
      primary: '#16A34A',
      primaryHover: '#15803D',
      primaryLight: '#DCFCE7',
      
      // Secondary - Purple (AI/Premium)
      secondary: '#7C3AED',
      secondaryHover: '#6D28D9',
      secondaryLight: '#F5F3FF',
      
      // Accent - Blue
      accent: '#3B82F6',
      accentHover: '#2563EB',
      accentLight: '#DBEAFE',
      
      // Success - Green
      success: '#16A34A',
      successHover: '#15803D',
      successLight: '#DCFCE7',
      
      // Warning - Amber
      warning: '#F59E0B',
      warningHover: '#D97706',
      warningLight: '#FEF3C7',
      
      // Danger - Red
      danger: '#DC2626',
      dangerHover: '#B91C1C',
      dangerLight: '#FEE2E2',
      
      // Neutral - Gray
      neutral: '#6B7280',
      neutralHover: '#0F172A',
    },
  },

  // 2. DARK THEME - Elegant Dark Mode
  'dark': {
    id: 'dark',
    name: 'Dunkel',
    description: 'Dunkler eleganter Modus',
    colors: {
      background: '#0F172A',
      text: '#F1F5F9',
      textSecondary: '#94A3B8',
      card: '#1E293B',
      border: '#334155',
      
      // Primary - Green (Medical)
      primary: '#22C55E',
      primaryHover: '#16A34A',
      primaryLight: '#14532D',
      
      // Secondary - Purple (AI/Premium)
      secondary: '#A78BFA',
      secondaryHover: '#8B5CF6',
      secondaryLight: '#4C1D95',
      
      // Accent - Blue
      accent: '#60A5FA',
      accentHover: '#3B82F6',
      accentLight: '#1E3A8A',
      
      // Success - Green
      success: '#22C55E',
      successHover: '#16A34A',
      successLight: '#14532D',
      
      // Warning - Amber
      warning: '#FBBF24',
      warningHover: '#F59E0B',
      warningLight: '#78350F',
      
      // Danger - Red
      danger: '#F87171',
      dangerHover: '#EF4444',
      dangerLight: '#7F1D1D',
      
      // Neutral - Gray
      neutral: '#94A3B8',
      neutralHover: '#CBD5E1',
    },
  },

  // 3. MEDICAL THEME - Green Healthcare Focus
  'medical': {
    id: 'medical',
    name: 'Medical',
    description: 'Medizinischer grüner Modus',
    colors: {
      background: '#F0FDF4',
      text: '#14532D',
      textSecondary: '#15803D',
      card: '#FFFFFF',
      border: '#BBF7D0',
      
      // Primary - Medical Green
      primary: '#16A34A',
      primaryHover: '#15803D',
      primaryLight: '#DCFCE7',
      
      // Secondary - Teal (Medical accent)
      secondary: '#0D9488',
      secondaryHover: '#0F766E',
      secondaryLight: '#CCFBF1',
      
      // Accent - Emerald
      accent: '#10B981',
      accentHover: '#059669',
      accentLight: '#D1FAE5',
      
      // Success - Green
      success: '#16A34A',
      successHover: '#15803D',
      successLight: '#DCFCE7',
      
      // Warning - Amber
      warning: '#F59E0B',
      warningHover: '#D97706',
      warningLight: '#FEF3C7',
      
      // Danger - Red
      danger: '#DC2626',
      dangerHover: '#B91C1C',
      dangerLight: '#FEE2E2',
      
      // Neutral - Gray-Green
      neutral: '#6B7280',
      neutralHover: '#14532D',
    },
  },

  // 4. PREMIUM THEME - Purple Luxury
  'premium': {
    id: 'premium',
    name: 'Premium',
    description: 'Premium lila Modus',
    colors: {
      background: '#FAF5FF',
      text: '#581C87',
      textSecondary: '#7E22CE',
      card: '#FFFFFF',
      border: '#E9D5FF',
      
      // Primary - Deep Purple
      primary: '#7C3AED',
      primaryHover: '#6D28D9',
      primaryLight: '#F5F3FF',
      
      // Secondary - Violet
      secondary: '#A78BFA',
      secondaryHover: '#8B5CF6',
      secondaryLight: '#EDE9FE',
      
      // Accent - Fuchsia
      accent: '#C026D3',
      accentHover: '#A21CAF',
      accentLight: '#FAE8FF',
      
      // Success - Green
      success: '#16A34A',
      successHover: '#15803D',
      successLight: '#DCFCE7',
      
      // Warning - Amber
      warning: '#F59E0B',
      warningHover: '#D97706',
      warningLight: '#FEF3C7',
      
      // Danger - Red
      danger: '#DC2626',
      dangerHover: '#B91C1C',
      dangerLight: '#FEE2E2',
      
      // Neutral - Purple-Gray
      neutral: '#6B7280',
      neutralHover: '#581C87',
    },
  },

  // 5. OCEAN THEME - Blue Calm
  'ocean': {
    id: 'ocean',
    name: 'Ocean',
    description: 'Ozean blauer Modus',
    colors: {
      background: '#EFF6FF',
      text: '#1E3A8A',
      textSecondary: '#3B82F6',
      card: '#FFFFFF',
      border: '#BFDBFE',
      
      // Primary - Sky Blue
      primary: '#0EA5E9',
      primaryHover: '#0284C7',
      primaryLight: '#E0F2FE',
      
      // Secondary - Indigo
      secondary: '#6366F1',
      secondaryHover: '#4F46E5',
      secondaryLight: '#E0E7FF',
      
      // Accent - Cyan
      accent: '#06B6D4',
      accentHover: '#0891B2',
      accentLight: '#CFFAFE',
      
      // Success - Green
      success: '#16A34A',
      successHover: '#15803D',
      successLight: '#DCFCE7',
      
      // Warning - Amber
      warning: '#F59E0B',
      warningHover: '#D97706',
      warningLight: '#FEF3C7',
      
      // Danger - Red
      danger: '#DC2626',
      dangerHover: '#B91C1C',
      dangerLight: '#FEE2E2',
      
      // Neutral - Blue-Gray
      neutral: '#6B7280',
      neutralHover: '#1E3A8A',
    },
  },

  // 6. FOREST THEME - Nature Green
  'forest': {
    id: 'forest',
    name: 'Forest',
    description: 'Wald grüner Modus',
    colors: {
      background: '#F7FEE7',
      text: '#3F6212',
      textSecondary: '#65A30D',
      card: '#FFFFFF',
      border: '#D9F99D',
      
      // Primary - Lime Green
      primary: '#65A30D',
      primaryHover: '#4D7C0F',
      primaryLight: '#ECFCCB',
      
      // Secondary - Emerald
      secondary: '#10B981',
      secondaryHover: '#059669',
      secondaryLight: '#D1FAE5',
      
      // Accent - Yellow-Green
      accent: '#84CC16',
      accentHover: '#65A30D',
      accentLight: '#ECFCCB',
      
      // Success - Green
      success: '#16A34A',
      successHover: '#15803D',
      successLight: '#DCFCE7',
      
      // Warning - Amber
      warning: '#F59E0B',
      warningHover: '#D97706',
      warningLight: '#FEF3C7',
      
      // Danger - Red
      danger: '#DC2626',
      dangerHover: '#B91C1C',
      dangerLight: '#FEE2E2',
      
      // Neutral - Olive
      neutral: '#6B7280',
      neutralHover: '#3F6212',
    },
  },
};

export const defaultTheme: ThemeId = 'light';
