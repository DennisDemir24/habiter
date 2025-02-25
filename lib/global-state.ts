export interface Habit {
    id: number;
    title: string;
    description: string;
    color: string;
    icon: string;
    completed: boolean;
    interval: string;
    priority: 'low' | 'medium' | 'high';
}


const INITIAL_HABITS: Habit[] = [
    {
      id: 1,
      title: 'Reading',
      description: 'Read 20 pages',
      color: '#fcd34d',
      icon: 'book',
      completed: false,
      interval: 'Every day',
      priority: 'high',
    },
    {
      id: 2,
      title: 'Household',
      description: 'Make bed in morning',
      color: '#86efac',
      icon: 'bed',
      completed: true,
      interval: 'Every day',
      priority: 'medium',
    },
    {
      id: 3,
      title: 'Programming',
      description: 'Write mini-games in C#',
      color: '#e5e7eb',
      icon: 'desktop',
      completed: false,
      interval: 'Weekdays',
      priority: 'low',
    },
    {
      id: 4,
      title: 'Positive thinking',
      description: 'Write 10 affirmations',
      color: '#93c5fd',
      icon: 'happy',
      completed: true,
      interval: 'Every day',
      priority: 'high',
    },
    {
      id: 5,
      title: 'Financial literacy',
      description: 'Record all expenses',
      color: '#f9a8d4',
      icon: 'wallet',
      completed: false,
      interval: 'Every day',
      priority: 'medium',
    },
    {
      id: 6,
      title: 'Sleep routine',
      description: 'Sleep for 8 hours',
      color: '#e5e7eb',
      icon: 'alarm',
      completed: false,
      interval: 'Every day',
      priority: 'high',
    },
  ];


  // Create a global state to share habits between screens
let habits = INITIAL_HABITS;
let listeners: ((habits: Habit[]) => void)[] = [];

export function getHabits() {
  return habits;
}

export function setHabits(newHabits: Habit[]) {
    habits = newHabits;
    // Notify all listeners of the update
    listeners.forEach(listener => listener(newHabits));
}

export function subscribeToHabits(listener: (habits: Habit[]) => void) {
    listeners.push(listener);
    return () => {
        listeners = listeners.filter(l => l !== listener);
    };
}

export type JournalEntry = {
    id: number;
    title: string;
    content: string;
    mood?: string;
    date: Date;
    tags?: string[];
};

// Global state for journal entries
let journalEntries: JournalEntry[] = [];
let journalListeners: ((entries: JournalEntry[]) => void)[] = [];

export function getJournalEntries() {
    return journalEntries;
}

export function setJournalEntries(newEntries: JournalEntry[]) {
    journalEntries = newEntries;
    // Notify all listeners of the update
    journalListeners.forEach(listener => listener(newEntries));
}

export function subscribeToJournalEntries(listener: (entries: JournalEntry[]) => void) {
    journalListeners.push(listener);
    return () => {
        journalListeners = journalListeners.filter(l => l !== listener);
    };
}