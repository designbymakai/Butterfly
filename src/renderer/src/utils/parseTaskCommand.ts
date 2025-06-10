export function parseTaskCommand(command: string) {
  // Regex to extract the title and due date from a plain text command.
  const regex = /(?:new|create|add|make|set)\s+task:\s*(?<title>.+?)\s+(?:on|by)\s+(?<dueDate>\w+)/i;
  const match = command.match(regex);
  if (!match || !match.groups?.title || !match.groups?.dueDate) {
    return null;
  }
  
  const title = match.groups.title.trim();
  const dueDateToken = match.groups.dueDate.trim();

  // Convert the due date token (assuming weekday name) to the next occurrence.
  const now = new Date();
  const daysOfWeek: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  let dueDate: string;
  if (daysOfWeek.hasOwnProperty(dueDateToken.toLowerCase())) {
    const targetDay = daysOfWeek[dueDateToken.toLowerCase()];
    // Calculate days until the next target day.
    const diff = ((targetDay + 7 - now.getDay()) % 7) || 7;
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + diff);
    dueDate = targetDate.toISOString();
  } else {
    // If not a weekday, attempt a direct parse.
    const parsedDate = new Date(dueDateToken);
    dueDate = isNaN(parsedDate.getTime()) ? now.toISOString() : parsedDate.toISOString();
  }

  // Build the task object.
  return {
    title,
    dueDate,
    project: "", // Optionally extract or set a default project.
    tags: []     // Optionally extract or set default tags.
  };
}