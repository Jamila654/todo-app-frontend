'use server';

import { revalidatePath } from 'next/cache';

const API = process.env.NEXT_PUBLIC_API || 'http://localhost:8000';

export async function getTasks(params: URLSearchParams) {
  try {
    const res = await fetch(`${API}/tasks?${params.toString()}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error('Backend error:', res.status);
      return [];  // Empty list on error
    }
    const data = await res.json();
    return data || [];
  } catch (e) {
    console.error('Fetch failed:', e);
    return [];
  }
}

export async function createTask(formData: FormData) {
  await fetch(`${API}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.fromEntries(formData)),
  });
  revalidatePath('/');
}

export async function updateTask(id: number, updates: Record<string, string | boolean>) {
  await fetch(`${API}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  revalidatePath('/');
}

export async function deleteTask(id: number) {
  await fetch(`${API}/tasks/${id}`, { method: 'DELETE' });
  revalidatePath('/');
}