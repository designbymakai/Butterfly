import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCommentDots } from '@fortawesome/free-solid-svg-icons'

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
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const getTaskDueDate = (task: any) => {
    const raw = task.dueDate || task.date;
    return raw ? new Date(raw) : null;
  };

  const overdueTasks = tasks.filter(
    (task) =>
      !task.completed &&
      getTaskDueDate(task) &&
      getTaskDueDate(task) < today
  );
  const overdueCount = overdueTasks.length;
  

  const suggestions = [
    "You haven't planned tomorrow yet.",
    overdueCount > 0 ? `${overdueCount} tasks are overdue.` : null,
    "Block time for 'Review notes'?"
  ].filter(Boolean);
  console.log('SmartSuggestionCard tasks:', tasks);
  console.log('Overdue tasks:', overdueTasks);
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