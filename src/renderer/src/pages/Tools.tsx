import React from 'react';
import PomodoroTimer from '../components/Pomodoro';

function Tools() {
    return (
    <div className="flex flex-col h-full w-full p-4 rounded-3xl justify-between bg-b-white-100">
        <PomodoroTimer />
    </div>
    );
}

export default Tools;
