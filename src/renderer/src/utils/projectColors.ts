export const projectColors = [
  '#235789',
  '#9F196B',
  '#E26513',
  '#0F4C5C',
  '#519E8A',
  '#EF798A',
  '#D14081',
  '#BD4B51',
  '#7792FE',
  '#00C49A',
  '#FF66B3'
];

export function getProjectColorByIndex(index: number): string {
  return projectColors[index % projectColors.length];
}

export function getRandomProjectColor(): string {
  const randomIndex = Math.floor(Math.random() * projectColors.length);
  return projectColors[randomIndex];
}

/**
 * Retrieve a project color based on options.
 * option.mode: 'order' returns a color in order given the index.
 * option.mode: 'random' returns a randomly selected color.
 */
export function getProjectColor(options: { mode: 'order'; index: number } | { mode: 'random' }): string {
  if (options.mode === 'order') {
    return getProjectColorByIndex(options.index);
  } else {
    return getRandomProjectColor();
  }
}