'use client';

import { Suspense } from 'react';
import TasksPage from './TasksPage'; // we'll create this in 10 seconds

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-2xl text-gray-600">Loading tasks...</div>
      </div>
    }>
      <TasksPage />
    </Suspense>
  );
}