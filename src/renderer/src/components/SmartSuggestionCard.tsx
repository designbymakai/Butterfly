import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCommentDots } from '@fortawesome/free-solid-svg-icons'

export async function getSmartSuggestions(tasks: any[], _events: any[]): Promise<string[]> {
  // In a real implementation, you would call an AI function with a schema like:
  // {
  //   "name": "getSmartSuggestions",
  //   "parameters": { tasks, events }
  // }
  // For demonstration, we return static suggestions.
  return [
    "You haven't planned tomorrow yet.",
    '3 tasks are overdue.',
    "Block time for 'Review notes'?"
  ]
}

interface SmartSuggestionCardProps {
  tasks: any[]
  events: any[]
  onSuggestionClick: (suggestion: string) => void
}

const SmartSuggestionCard: React.FC<SmartSuggestionCardProps> = ({
  tasks,
  events,
  onSuggestionClick
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    async function fetchSuggestions() {
      const result = await getSmartSuggestions(tasks, events)
      setSuggestions(result)
    }
    fetchSuggestions()
  }, [tasks, events])

  return (
    <div className="p-4 rounded-lg shadow-lg bg-b-black-300 text-b-white-100">
      <div className="flex items-center space-x-2 mb-2">
        <FontAwesomeIcon icon={faCommentDots} className="text-b-blue-300" />
        <span className="font-bold text-lg">Smart Suggestions</span>
      </div>
      <ul className="list-disc pl-4">
        {suggestions.map((suggestion, index) => (
          <li
            key={index}
            className="cursor-pointer hover:underline"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SmartSuggestionCard
