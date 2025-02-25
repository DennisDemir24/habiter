export type Category = {
    id: string;
    name: string;
    color: string;
    icon: string;
};

export type Tag = {
    id: string;
    name: string;
};

export interface Habit {
    id: string;
    title: string;
    description?: string;
    categoryId: string;
    tags: string[];  // Array of tag IDs
    frequency: 'daily' | 'weekly' | 'weekday' | 'weekend';
    completed: boolean;
    createdAt: Date;
} 