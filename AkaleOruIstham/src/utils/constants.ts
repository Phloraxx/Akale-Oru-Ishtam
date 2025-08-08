export const VIBE_CATEGORIES = {
  aesthetic: ['minimalist', 'chaotic', 'vintage', 'futuristic'],
  emotional: ['hopeful', 'melancholic', 'anxious', 'confident'],
  personality: ['introverted', 'dramatic', 'mysterious', 'cheerful'],
  campus: ['academic', 'procrastinating', 'caffeinated', 'stressed']
};

export const ALL_VIBES = [
  ...VIBE_CATEGORIES.aesthetic,
  ...VIBE_CATEGORIES.emotional,
  ...VIBE_CATEGORIES.personality,
  ...VIBE_CATEGORIES.campus
];

export const CAMPUS_LOCATIONS = [
  { name: 'Library', description: 'The place where dreams go to die' },
  { name: 'Cafeteria', description: 'Sustenance for the soul' },
  { name: 'Computer Lab', description: 'Where code comes alive' },
  { name: 'Hostel', description: 'Home away from home' },
  { name: 'Playground', description: 'Where legends are made' },
  { name: 'Parking Lot', description: 'Vehicle paradise' },
  { name: 'Classroom', description: 'Knowledge transfer station' },
  { name: 'Auditorium', description: 'Where voices echo' }
];

export const APP_COLORS = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  accent: '#45B7D1',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  border: '#E0E6ED',
  success: '#2ECC71',
  warning: '#F39C12',
  error: '#E74C3C'
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System'
};
