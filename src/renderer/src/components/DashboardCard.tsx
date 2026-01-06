import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faRecycle, faFolderOpen, faTasks } from '@fortawesome/free-solid-svg-icons'
import moment from 'moment';
import {
  faStop,
  faSpinner,
  faHourglassHalf,
  faMagnifyingGlassChart,
  faFlagCheckered,
} from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const progressOptions = [
  { label: "Not Started", icon: faStop },
  { label: "In Progress", icon: faSpinner },
  { label: "Waiting", icon: faHourglassHalf },
  { label: "Needs Review", icon: faMagnifyingGlassChart },
];

interface Todo {
  title: string
  project?: string
  dueDate?: string
  date?: string
  completed?: boolean
  recurring?: boolean
}

interface Task {
  title: string
  dueDate?: string
  date?: string
  completed?: boolean
  recurring?: boolean
  project?: string
  progress?: string
  completedAt?: string
}

interface Event {
  title: string
  start: string
}

interface DashboardCardProps {
  todos: Todo[]
  tasks: Task[]
  events: Event[]
  onJumpToProject: (projectName?: string) => void // <-- update this
}

const DashboardCard: React.FC<DashboardCardProps> = ({ todos, tasks, events, onJumpToProject }) => {
  const safeTasks = tasks || []
  const safeEvents = events || []

  const progressCounts = progressOptions.map(opt => ({
    ...opt,
    count: safeTasks.filter(
      (todo) => !todo.completed && todo.progress === opt.label
    ).length,
  }));

  const projectVisits = JSON.parse(localStorage.getItem('projectVisits') || '[]');
  const weekAgo = moment().subtract(6, 'days').startOf('day');
  const completedThisWeek = safeTasks.filter(
    (todo) =>
      todo.completed &&
      todo.completedAt &&
      moment(todo.completedAt).isSameOrAfter(weekAgo, 'day')
  );
  const completedThisWeekCount = completedThisWeek.length;

  const recentProjectVisits = projectVisits
    .filter((visit: { name: string; timestamp: string }) =>
      moment(visit.timestamp).isSameOrAfter(weekAgo, 'day')
    )
    .reverse();
      const recentProjects: string[] = [];
for (const visit of recentProjectVisits) {
  const normalized = visit.name.trim();
  if (!recentProjects.includes(normalized)) {
    recentProjects.push(normalized);
    if (recentProjects.length === 3) break;
  }
}
  

  const [visitUpdate, setVisitUpdate] = useState(0);

useEffect(() => {
  const handler = () => setVisitUpdate(v => v + 1);
  window.addEventListener('projectVisitLogged', handler);
  return () => window.removeEventListener('projectVisitLogged', handler);
}, []);

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tasksToday = safeTasks.filter((todo) => {
    const dueStr = todo.dueDate || todo.date
    if (!dueStr) return false
    const dueDate = new Date(dueStr)
    return dueDate.toDateString() === today.toDateString()
  })
  const completedToday = tasksToday.filter((todo) => todo.completed).length
  const totalToday = tasksToday.length

  const upcomingRecurringCount = safeTasks.filter((todo) => todo.recurring).length || 0

  

  const upcomingItems = [
    ...safeTasks
      .filter((todo) => todo.dueDate || todo.date)
      .map((todo) => ({
        type: 'task',
        title: todo.title,
        date: new Date(todo.dueDate ?? todo.date ?? '')
      })),
    ...safeEvents
      .filter((event) => event.start)
      .map((event) => ({
        type: 'event',
        title: event.title,
        date: new Date(event.start)
      }))
  ]
    .filter((item) => item.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3)

  const [isDeadlinesExpanded, setIsDeadlinesExpanded] = useState(false)

  return (
    <div className="p-4 rounded-lg shadow-lg bg-b-black-300 text-b-white-100 mb-4">
      <h2 className="text-xl font-bold mb-2">Dashboard</h2>
      <div className="flex flex-wrap gap-x-8 gap-y-2 items-center">
        {/* Task Progress */}
        <div className="flex items-center space-x-2">
          <Tippy content="Tasks completed today">
            <span>
              <FontAwesomeIcon icon={faCheckCircle} className="text-b-blue-300 text-xl" />
            </span>
          </Tippy>
          <span className="text-xs">{completedToday} of {totalToday} today</span>
        </div>
        {/* Tasks Completed This Week */}
        <div className="flex items-center space-x-2">
          <Tippy content="Tasks completed this week">
            <span>
              <FontAwesomeIcon icon={faFlagCheckered} className="text-b-blue-300 text-xl" />
            </span>
          </Tippy>
          <span className="text-xs">{completedThisWeekCount} this week</span>
        </div>
        {/* Progress Breakdown */}
        <div className="flex items-center space-x-2">
          {progressCounts.map((opt) => (
            <Tippy key={opt.label} content={opt.label}>
              <span className="flex flex-col items-center">
                <FontAwesomeIcon icon={opt.icon} className="text-b-blue-300 text-lg" />
                <span className="font-bold text-b-white-100 text-xs">{opt.count}</span>
              </span>
            </Tippy>
          ))}
        </div>
        {/* Upcoming Recurring Tasks */}
        <div className="flex items-center space-x-2">
          <Tippy content="Recurring tasks">
            <span>
              <FontAwesomeIcon icon={faRecycle} className="text-b-blue-300 text-xl" />
            </span>
          </Tippy>
          <span className="text-xs">{upcomingRecurringCount} recurring</span>
        </div>
        {/* Upcoming Deadlines */}
        <div className="flex items-center space-x-2 relative">
          <Tippy content="Upcoming deadlines">
            <span>
              <FontAwesomeIcon icon={faTasks} className="text-b-blue-300 text-xl" />
            </span>
          </Tippy>
          <div className="relative">
            <div className={`overflow-hidden ${isDeadlinesExpanded ? '' : 'max-h-12'}`}>
              {upcomingItems.length > 0 ? (
                <ul className="text-xs">
                  {upcomingItems.map((item, index) => (
                    <li key={index} className="text-b-white-300">
                      {item.title} -{' '}
                      {item.date.toLocaleDateString(undefined, {
                        month: '2-digit',
                        day: '2-digit'
                      })}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-xs">No deadlines</span>
              )}
            </div>
            {!isDeadlinesExpanded && (
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-b-black-300 flex items-center justify-center">
                <button onClick={() => setIsDeadlinesExpanded(true)} className="text-b-white-300 text-xs">
                  +
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Recent Projects */}
        {/* Recent Projects */}
        <div className="flex items-center space-x-2">
          <Tippy content="Recent projects visited this week">
            <span>
              <FontAwesomeIcon icon={faFolderOpen} className="text-b-blue-300 text-xl" />
            </span>
          </Tippy>
          <span className="text-xs flex flex-wrap gap-1">
            {recentProjects.length > 0
              ? recentProjects.map((proj, idx) => (
                  <button
                    key={proj}
                    className="underline text-b-blue-200 hover:text-b-blue-400 transition-colors"
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    onClick={() => onJumpToProject(proj)}
                  >
                    {proj}
                    {idx < recentProjects.length - 1 ? ',' : ''}
                  </button>
                ))
              : 'No recent projects'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default DashboardCard