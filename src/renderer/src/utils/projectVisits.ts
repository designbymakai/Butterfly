export function logProjectVisit(projectName: string) {
  const normalized = projectName.trim();
  const visits = JSON.parse(localStorage.getItem('projectVisits') || '[]');
  visits.push({ name: normalized, timestamp: new Date().toISOString() });
  localStorage.setItem('projectVisits', JSON.stringify(visits));
  window.dispatchEvent(new Event('projectVisitLogged'));
}