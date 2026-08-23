import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface VoiceAvatarProps {
    src?: string;
    name: string;
    score?: number;
    className?: string;
    imageClassName?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

function getInitials(name: string): string {
    if (!name) return 'V';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    if (parts[0].includes('.')) {
        const first = parts[0].replace(/\./g, '');
        const rest = parts.slice(1).map(p => p[0]).join('');
        return (first + rest).slice(0, 3).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getBiasStyles(score: number = 0) {
    if (score <= -15) {
        return {
            bg: 'bg-blue-50 dark:bg-blue-950/40',
            text: 'text-blue-700 dark:text-blue-300',
            border: 'border-blue-200/80 dark:border-blue-800/50',
            ring: 'ring-blue-500/20',
        };
    }
    if (score >= 15) {
        return {
            bg: 'bg-rose-50 dark:bg-rose-950/40',
            text: 'text-rose-700 dark:text-rose-300',
            border: 'border-rose-200/80 dark:border-rose-800/50',
            ring: 'ring-rose-500/20',
        };
    }
    return {
        bg: 'bg-slate-100 dark:bg-slate-900',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-200/80 dark:border-slate-800/50',
        ring: 'ring-slate-500/20',
    };
}

const SIZE_MAP = {
    sm: 'w-10 h-10 text-xs rounded-xl',
    md: 'w-16 h-16 text-sm rounded-2xl',
    lg: 'w-20 h-20 text-lg rounded-2xl',
    xl: 'w-36 h-36 md:w-44 md:h-44 text-3xl md:text-4xl rounded-3xl',
};

export const VoiceAvatar = ({
    src,
    name,
    score = 0,
    className,
    imageClassName,
    size = 'md',
}: VoiceAvatarProps) => {
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        setImgError(false);
    }, [src]);
    const initials = getInitials(name);
    const biasStyle = getBiasStyles(score);
    const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;

    const hasValidImage = src && !imgError;

    return (
        <div
            className={cn(
                'relative shrink-0 overflow-hidden border shadow-sm flex items-center justify-center select-none',
                sizeClasses,
                biasStyle.bg,
                biasStyle.border,
                className
            )}
        >
            {hasValidImage ? (
                <img
                    src={src}
                    alt={name}
                    className={cn(
                        'w-full h-full object-cover transition-transform duration-300 group-hover:scale-105',
                        imageClassName
                    )}
                    loading="lazy"
                    onError={() => setImgError(true)}
                />
            ) : (
                <div className={cn('flex flex-col items-center justify-center font-serif font-black tracking-wider', biasStyle.text)}>
                    <span>{initials}</span>
                </div>
            )}
        </div>
    );
};
