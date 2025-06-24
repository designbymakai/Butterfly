import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faRecycle, faFolderOpen, faTasks } from '@fortawesome/free-solid-svg-icons'

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
}

interface Event {
  title: string
  start: string
}

interface DashboardCardProps {
  todos: Todo[]
  tasks: Task[]
  events: Event[]
  onJumpToProject: () => void
}

const DashboardCard: React.FC<DashboardCardProps> = ({ todos, tasks, events, onJumpToProject }) => {
  // Safe arrays to avoid undefined errors
  const safeTasks = tasks || []
  const safeEvents = events || []

  // Calculate task progress for today
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

  // Upcoming recurring tasks count
  const upcomingRecurringCount = safeTasks.filter((todo) => todo.recurring).length || 0

  // Recent projects from todos
  const recentProjects = Array.from(
    new Set(todos.map((todo) => todo.project).filter((proj) => proj && proj.trim() !== ''))
  )

  // Compute upcoming deadlines (tasks and events) and take the first 3
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

  // State to handle expansion of the upcoming deadlines cell
  const [isDeadlinesExpanded, setIsDeadlinesExpanded] = useState(false)

  return (
    <div className="p-4 rounded-lg shadow-lg bg-b-black-300 text-b-white-100 mb-4">
      <h2 className="text-xl font-bold mb-2">Dashboard</h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Task Progress */}
        <div className="flex flex-col items-center p-2 bg-b-black-400 rounded-lg">
          <FontAwesomeIcon icon={faCheckCircle} className="text-b-blue-300 text-3xl mb-2" />
          <p>
            {completedToday} of {totalToday} completed today
          </p>
        </div>
        {/* Upcoming Recurring Tasks */}
        <div className="flex flex-col items-center p-2 bg-b-black-400 rounded-lg">
          <FontAwesomeIcon icon={faRecycle} className="text-b-blue-300 text-3xl mb-2" />
          <p>{upcomingRecurringCount} recurring tasks</p>
        </div>
        {/* Upcoming Deadlines */}
        <div className="flex flex-col items-center p-2 bg-b-black-400 rounded-lg relative">
          <FontAwesomeIcon icon={faTasks} className="text-b-blue-300 text-3xl mb-2" />
          <div className="w-full relative">
            <div className={`overflow-hidden ${isDeadlinesExpanded ? '' : 'max-h-16'}`}>
              {upcomingItems.length > 0 ? (
                <ul className="text-center text-sm">
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
                <p>No upcoming deadlines</p>
              )}
            </div>
            {!isDeadlinesExpanded && (
              <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-b-black-400 flex items-center justify-center">
                <button onClick={() => setIsDeadlinesExpanded(true)} className="text-b-white-300">
                  +
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Recent Projects */}
        <div
          className="flex flex-col items-center p-2 bg-b-black-400 rounded-lg cursor-pointer"
          onClick={onJumpToProject}
        >
          <FontAwesomeIcon icon={faFolderOpen} className="text-b-blue-300 text-3xl mb-2" />
          <p>{recentProjects.length} Recent Projects</p>
        </div>
      </div>
    </div>
  )
}

export default DashboardCard
