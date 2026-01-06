export function formatTaskDate(date: string | Date | undefined, dateFormat: string = 'US') {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  if (dateFormat === 'EU') {
    return `${day}/${month}`;
  }
  // US default
  return `${month}/${day}`;
}