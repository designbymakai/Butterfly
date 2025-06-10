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
export function getProjectColor(projectName: string): string {
  if (!projectName || projectName === 'Unassigned') return '#FAF9F9';
  let hash = 0;
  for (let i = 0; i < projectName.length; i++) {
    hash = projectName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % projectColors.length;
  return projectColors[index];
}


export function getProjectColorForName(
  projectName: string,
  projects: { name: string; color: string }[]
): string {
  const project = projects.find((p) => p.name === projectName);
  return project ? project.color : '#FAF9F9'; // default if not found
}