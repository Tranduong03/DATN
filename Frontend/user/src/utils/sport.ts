/**
 * Dynamic helpers to resolve sport attributes (emoji, color) using categories loaded from the database.
 */

export const FALLBACK_SPORTS = [
  { name: 'Cầu lông', icon: '🏸', color: '#50E3C2' },
  { name: 'Pickleball', icon: '🏓', color: '#4A90E2' },
  { name: 'Bóng đá', icon: '⚽', color: '#7ED321' },
  { name: 'Quần vợt', icon: '🎾', color: '#F5A623' },
  { name: 'Golf', icon: '⛳', color: '#417505' },
  { name: 'Bóng chuyền', icon: '🏐', color: '#F8E71C' },
  { name: 'Bóng rổ', icon: '🏀', color: '#FF9500' },
  { name: 'Khác', icon: '🏆', color: '#303c4f' },
];

const normalizeSportName = (name: string): string => {
  const s = name.toLowerCase().trim();
  if (s === 'tennis') return 'quần vợt';
  return s;
};

export const getSportEmojiFromCategories = (sportName: string, categories: any[]): string => {
  if (!sportName) return '🏆';
  const s = normalizeSportName(sportName);
  const found = categories.find((cat: any) => {
    const name = normalizeSportName(cat.name);
    return name === s || s.includes(name) || name.includes(s);
  });
  return found?.icon || '🏆';
};

export const getSportColorFromCategories = (sportName: string, categories: any[]): string => {
  if (!sportName) return '#10b981';
  const s = normalizeSportName(sportName);
  const found = categories.find((cat: any) => {
    const name = normalizeSportName(cat.name);
    return name === s || s.includes(name) || name.includes(s);
  });
  return found?.color || '#10b981';
};

export const hexToRgba = (hex: string, alpha: number): string => {
  if (!hex || !hex.startsWith('#')) return `rgba(16, 185, 129, ${alpha})`;
  const cleanHex = hex.replace('#', '');
  let r = 0, g = 0, b = 0;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  } else {
    return `rgba(16, 185, 129, ${alpha})`;
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
