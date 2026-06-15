/**
 * Dynamic helpers to resolve sport attributes (emoji, color) using categories loaded from the database.
 */

export const getSportEmojiFromCategories = (sportName: string, categories: any[]): string => {
  if (!sportName) return '🏆';
  const s = sportName.toLowerCase().trim();
  const found = categories.find((cat: any) => {
    const name = cat.name.toLowerCase().trim();
    return name === s || s.includes(name) || name.includes(s);
  });
  return found?.icon || '🏆';
};

export const getSportColorFromCategories = (sportName: string, categories: any[]): string => {
  if (!sportName) return '#10b981';
  const s = sportName.toLowerCase().trim();
  const found = categories.find((cat: any) => {
    const name = cat.name.toLowerCase().trim();
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
