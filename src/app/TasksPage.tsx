'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar, Plus, Search, X, Circle, CheckCircle2 } from 'lucide-react';

type Task = {
  id: number;
  title: string;
  completed: boolean;
  priority: 'High' | 'Medium' | 'Low';
  due: string | null;
  tags: string;
};

const API = 'https://todo-app-backend-swart.vercel.app';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const q = searchParams.get('q') ?? '';
  const status = searchParams.get('status') ?? '';
  const priority = searchParams.get('priority') ?? '';

  const updateQuery = (updates: Record<string, string | null>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    router.replace(`/?${p.toString()}`, { scroll: false });
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (q) p.set('search', q);
    if (status) p.set('status', status);
    if (priority) p.set('priority', priority);

    try {
      const res = await fetch(`${API}/tasks?${p}`, { cache: 'no-store' });
      const data: Task[] = res.ok ? await res.json() : [];
      setTasks(data);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [q, status, priority]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = {
      title: (f.get('title') as string).trim(),
      priority: (f.get('priority') as Task['priority']) || 'Medium',
      due: (f.get('due') as string) || null,
      tags: (f.get('tags') as string) || '',
    };
    if (!payload.title) return;

    await fetch(`${API}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    (e.target as HTMLFormElement).reset();
    fetchTasks();
  };

  const toggle = async (id: number, done: boolean) => {
    await fetch(`${API}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !done }),
    });
    fetchTasks();
  };

  const remove = async (id: number) => {
    await fetch(`${API}/tasks/${id}`, { method: 'DELETE' });
    fetchTasks();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            My Tasks
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">Get things done — beautifully.</p>
        </header>

        {/* Add Task */}
        <div className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-800 p-6 mb-8">
          <form onSubmit={addTask} className="space-y-4">
            <input
              name="title"
              required
              placeholder="What needs to be done?"
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 text-lg"
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <select title='nn'
                name="priority"
                defaultValue="Medium"
                className="px-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>

              <input title='hh'
                name="due"
                type="date"
                className="px-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
              />

              <input
                name="tags"
                placeholder="Tags (optional)"
                className="col-span-2 sm:col-span-1 px-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
              />

              <button
                type="submit"
                className="col-span-2 sm:col-span-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-2xl shadow-lg flex items-center justify-center gap-2 transition"
              >
                <Plus size={22} /> Add Task
              </button>
            </div>
          </form>
        </div>

        {/* Search & Filters */}
        <div className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-800 p-5 mb-8">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={q}
                onChange={(e) => updateQuery({ q: e.target.value || null })}
                className="w-full pl-12 pr-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-4 focus:ring-blue-500/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <select title="Filter by status"
                value={status}
                onChange={(e) => updateQuery({ status: e.target.value || null })}
                className="px-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
              >
                <option value="">All Tasks</option>
                <option value="active">Active</option>
                <option value="completed">Done</option>
              </select>

              <select title='dd'
                value={priority}
                onChange={(e) => updateQuery({ priority: e.target.value || null })}
                className="px-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
              >
                <option value="">Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-0">
            <Circle className="mx-auto h-20 w-20 text-gray-300 dark:text-gray-700 mb-6" />
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">No tasks yet</h2>
            <p className="mt-2 text-gray-500">Add one above and start winning!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="group bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl border border-gray-200/60 dark:border-gray-700/60 p-6 hover:shadow-2xl transition-all"
              >
                <div className="flex items-center gap-4">
                  <button onClick={() => toggle(task.id, task.completed)} className="flex-shrink-0">
                    {task.completed ? (
                      <CheckCircle2 size={28} className="text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Circle size={28} className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-medium break-words ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                      {task.title}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={`px-4 py-2 rounded-full text-white text-xs font-medium ${
                        task.priority === 'High' ? 'bg-red-500' :
                        task.priority === 'Medium' ? 'bg-amber-500' :
                        'bg-green-500'
                      }`}>
                        {task.priority}
                      </span>
                      {task.due && (
                        <span className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">
                          <Calendar size={15} />
                          {format(new Date(task.due), 'MMM d')}
                        </span>
                      )}
                      {task.tags.split(',').filter(Boolean).map((t) => (
                        <span key={t} className="px-3 py-2 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                          {t.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button title='hh'
                    onClick={() => remove(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-2.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition"
                  >
                    <X size={20} className="text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}