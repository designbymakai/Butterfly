import React from 'react';

const ProjectThermometer = ({ project }) => {
  const totalTasks = project.tasks.length;
  const notStartedTasks = project.tasks.filter(task => !task.started).length;
  const activeTasks = project.tasks.filter(task => task.started && !task.completed).length;
  const completedTasks = project.tasks.filter(task => task.completed).length;

  const notStartedPercentage = (notStartedTasks / totalTasks) * 100;
  const activePercentage = (activeTasks / totalTasks) * 100;
  const completedPercentage = (completedTasks / totalTasks) * 100;

  return (
    <div className="flex flex-col w-full h-full rounded-lg mx-4 justify-between">
      <p className="text-b-black-100 text-lg">{project.name}</p>
      <div className="flex h-4 w-full rounded-lg overflow-hidden">
        <div style={{ width: `${notStartedPercentage}%` }} className="bg-red-500"></div>
        <div style={{ width: `${activePercentage}%` }} className="bg-yellow-500"></div>
        <div style={{ width: `${completedPercentage}%` }} className="bg-green-500"></div>
      </div>
    </div>
  );
};

export default ProjectThermometer;