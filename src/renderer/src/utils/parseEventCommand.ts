export function parseEventCommand(command: string) {
  // New regex: make "at <time>" optional.
  const regex = /new event:\s*(?<title>.+?)\s+on\s+(?<day>\w+)(?:\s+at\s+(?<time>\d+(?::\d+)?(?:\s*(?:AM|PM))?))?(?:\s+(?<periodPhrase>in the (morning|afternoon|evening)))?/i;
  const match = command.match(regex);
  if (!match || !match.groups) {
    console.error("Invalid event command format", command);
    return null;
  }
  
  const title = match.groups.title.trim();
  const dayStr = match.groups.day.trim();
  // If the time part is missing, default to '12:00PM'
  let timeStr = match.groups.time ? match.groups.time.trim() : "12:00PM";
  const periodPhrase = match.groups.periodPhrase ? match.groups.periodPhrase.toLowerCase() : "";
  
  // If no explicit AM/PM in timeStr, derive it from periodPhrase.
  if (!/\b(AM|PM)\b/i.test(timeStr)) {
    if (periodPhrase.includes("morning")) {
      timeStr += "AM";
    } else if (periodPhrase.includes("afternoon") || periodPhrase.includes("evening")) {
      timeStr += "PM";
    }
  }
  
  console.log("Parsed Event Command:", { title, dayStr, timeStr });
  
  // Compute the event's start date based on the specified day.
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
  const targetDayIndex = daysOfWeek[dayStr.toLowerCase()];
  if (targetDayIndex === undefined) {
    console.error("Invalid day provided:", dayStr);
    return null;
  }
  
  let diff = ((targetDayIndex + 7 - now.getDay()) % 7) || 7;
  const eventDate = new Date(now);
  eventDate.setDate(now.getDate() + diff);
  
  // Parse the time string (now ensured to have an AM/PM)
  const timeParts = timeStr.match(/(\d+):?(\d*)\s*(AM|PM)/i);
  if (timeParts) {
    let hours = parseInt(timeParts[1], 10);
    const minutes = timeParts[2] ? parseInt(timeParts[2], 10) : 0;
    const period = timeParts[3].toUpperCase();
    if (period === 'PM' && hours < 12) {
      hours += 12;
    }
    if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    eventDate.setHours(hours, minutes, 0, 0);
  } else {
    console.error("Time parsing failed for:", timeStr);
    return null;
  }
  
  // Set a default duration of one hour.
  const endDate = new Date(eventDate);
  endDate.setHours(eventDate.getHours() + 1);
  
  return {
    title,
    description: "",
    start: eventDate.toISOString(),
    end: endDate.toISOString()
  };
}