import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
    const { resolvedTheme, toggleTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-black hover:bg-black/5 transition-colors"
            onClick={toggleTheme}
        >
            {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4" />
            ) : (
                <Moon className="w-4 h-4" />
            )}
            <span className="sr-only">Schimbă tema</span>
        </Button>
    );
}

// Simple toggle button (alternative)
export function ThemeToggleSimple() {
    const { resolvedTheme, toggleTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-black hover:bg-black/5 transition-colors"
            onClick={toggleTheme}
        >
            {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4" />
            ) : (
                <Moon className="w-4 h-4" />
            )}
            <span className="sr-only">Schimbă tema</span>
        </Button>
    );
}
