'use client';

import { useState } from 'react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ListTodo } from 'lucide-react';

// Mock data for now, since exact logic was not clarified
const MOCK_PRIORITIES = [
    { id: 1, date: 'July 2', completed: true },
    { id: 2, date: 'July 3', completed: true },
    { id: 3, date: 'July 4', completed: true },
    { id: 4, date: 'July 5', completed: true },
    { id: 5, date: 'July 6', completed: false },
    { id: 6, date: 'July 7', completed: false },
    { id: 7, date: 'July 8', completed: false },
];

export function PriorityTracker() {
    const total = MOCK_PRIORITIES.length;
    const completedCount = MOCK_PRIORITIES.filter(p => p.completed).length;
    const remainingCount = total - completedCount;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button 
                    variant="outline" 
                    className="relative bg-background border-primary/20 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 shadow-sm overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    <ListTodo className="w-4 h-4 mr-2 text-primary relative z-10" />
                    <span className="font-semibold relative z-10">{completedCount}/{total}</span>
                    <span className="ml-2 text-xs text-muted-foreground relative z-10">
                        ({remainingCount} left)
                    </span>
                    
                    {/* Kinetic emotion animation dot */}
                    {remainingCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3 bg-card border-border shadow-lg" align="end">
                <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-border/50">
                        <h4 className="font-semibold text-foreground">Pending Maqal</h4>
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                            {remainingCount} Remaining
                        </span>
                    </div>
                    
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                        {MOCK_PRIORITIES.map((task) => (
                            <div 
                                key={task.id} 
                                className={`flex items-center justify-between p-2 rounded-md border transition-colors ${
                                    task.completed 
                                    ? 'bg-muted/30 border-transparent opacity-60' 
                                    : 'bg-background border-border hover:border-primary/40'
                                }`}
                            >
                                <span className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground font-medium'}`}>
                                    {task.date}
                                </span>
                                {task.completed ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                ) : (
                                    <Circle className="w-4 h-4 text-muted-foreground/40" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
