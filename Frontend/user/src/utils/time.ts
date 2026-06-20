export const formatOperatingHour = (timeStr?: string): string => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  const hour = parseInt(parts[0], 10);
  const min = parseInt(parts[1], 10);
  if (hour === 23 && min === 59) {
    return '24:00';
  }
  const minStr = min.toString().padStart(2, '0');
  return `${hour}:${minStr}`;
};

export const mapDefaultHoursToOperating = (
  startStr: string,
  endStr: string,
  operatingStart?: string,
  operatingEnd?: string
): { start: string; end: string } => {
  const cleanStart = startStr.substring(0, 5);
  const cleanEnd = endStr.substring(0, 5);

  if (cleanStart === '00:00' && (cleanEnd === '23:59' || cleanEnd === '24:00')) {
    const defaultStart = operatingStart ? operatingStart.substring(0, 5) : '06:00';
    const defaultEnd = operatingEnd ? operatingEnd.substring(0, 5) : '22:00';
    return { start: defaultStart, end: defaultEnd };
  }

  return { start: cleanStart, end: cleanEnd };
};
