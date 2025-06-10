import { v4 as uuidv4 } from 'uuid';

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  project: string;
  tags: string[];
  icon: any;
  projectColor: string;
}

const workTitles = [
  "Finish quarterly report",
  "Schedule client meeting",
  "Email project updates",
  "Review team performance",
  "Prepare presentation slides",
  "Analyze market trends",
  "Develop new client pitch",
  "Organize team briefing",
  "Update project roadmap",
  "Plan resource allocation",
  "Conduct code review",
  "Fix reported bugs",
  "Optimize application performance",
  "Write unit tests",
  "Research new design trends",
  "Mock up user interface",
  "Coordinate marketing campaign",
  "Backup production database",
  "Prepare sprint retrospective",
  "Host training session"
];

const sampleDescriptions = [
  "Complete all sections and review for accuracy.",
  "Ensure the meeting agenda is prepared.",
  "Draft the update email and check with the team.",
  "Evaluate recent performance and provide feedback.",
  "Design slides for the upcoming presentation.",
  "Compile and analyze the relevant market data.",
  "Create a persuasive pitch for potential clients.",
  "Schedule and organize the briefing session.",
  "Review current objectives and update the roadmap.",
  "Plan resources based on current team capacity.",
  "Review pull requests and suggest improvements.",
  "Fix known issues from the latest QA report.",
  "Improve speed and memory usage of the app.",
  "Ensure proper test coverage for core features.",
  "Explore modern UI patterns and innovations.",
  "Create low and high fidelity UI mockups.",
  "Plan email and social media strategy.",
  "Backup all critical data and verify integrity.",
  "Gather feedback and identify improvements.",
  "Deliver a skills-focused session for new hires."
];

const sampleTags = [
  "urgent",
  "low-priority",
  "backend",
  "frontend",
  "design",
  "QA",
  "meeting",
  "planning",
  "research",
  "writing",
  "client",
  "internal",
  "sprint",
  "documentation"
];

const defaultProjectColors: string[] = [
  "#FF66B3",
  "#7792FE",
  "#EF798A",
  "#E26513",
  "#0F4C5C",
  "#9F196B"
];

/**
 * Creates a random todo.
 * @param activeProjects A list of active project names to randomly assign. If empty, project defaults to "Unassigned".
 * @returns A new Task object.
 */
export function createRandomTodo(activeProjects: string[] = []): Task {
  // Randomly pick a title and description.
  const randIdx = Math.floor(Math.random() * workTitles.length);
  const title = workTitles[randIdx];
  const description = sampleDescriptions[randIdx];
  
  // Generate a due date between today and 7 days from now.
  const daysOffset = Math.floor(Math.random() * 8); // 0 to 7 days
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + daysOffset);
  
  // Choose a random project from activeProjects if provided.
  let project = "Unassigned";
  let projectColor = "#FAF9F9";
  if (activeProjects.length > 0) {
    const projectIndex = Math.floor(Math.random() * activeProjects.length);
    project = activeProjects[projectIndex];
    // Randomly assign a color from defaultProjectColors.
    const colorIndex = Math.floor(Math.random() * defaultProjectColors.length);
    projectColor = defaultProjectColors[colorIndex];
  }
  
  // Randomly select 1–3 tags
  const tagCount = Math.floor(Math.random() * 3) + 1;
  const tags = Array.from(
    { length: tagCount },
    () => sampleTags[Math.floor(Math.random() * sampleTags.length)]
  );
  
  return {
    id: uuidv4(),
    title,
    description,
    dueDate: dueDate.toISOString(),
    completed: false,
    project,
    tags,
    icon: null,
    projectColor,
  };
}