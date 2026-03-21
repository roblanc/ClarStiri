import { Share2, Link2, Twitter, Facebook, Mail, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonProps {
    title: string;
    url?: string;
    description?: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    showLabel?: boolean;
}

export function ShareButton({
    title,
    url,
    description,
    variant = 'outline',
    size = 'default',
    className = '',
    showLabel = true,
}: ShareButtonProps) {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    // Use current URL if not provided
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const shareText = description || title;

    // Check if native share is available
    const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

    const handleNativeShare = async () => {
        try {
            await navigator.share({
                title,
                text: shareText,
                url: shareUrl,
            });
        } catch (error) {
            // User cancelled or error occurred
            if ((error as Error).name !== 'AbortError') {
                console.error('Share failed:', error);
            }
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast({
                title: 'Link copiat!',
                description: 'Link-ul a fost copiat în clipboard.',
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
            toast({
                title: 'Eroare',
                description: 'Nu am putut copia link-ul.',
                variant: 'destructive',
            });
        }
    };

    const shareToTwitter = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, '_blank', 'width=550,height=420');
    };

    const shareToFacebook = () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(facebookUrl, '_blank', 'width=550,height=420');
    };

    const shareByEmail = () => {
        const mailUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
        window.location.href = mailUrl;
    };

    // On mobile, use native share if available
    if (canNativeShare) {
        return (
            <Button
                variant={variant}
                size={size}
                className={className}
                onClick={handleNativeShare}
            >
                <Share2 className="w-4 h-4" />
                {showLabel && <span className="ml-2">Distribuie</span>}
            </Button>
        );
    }

    // On desktop, show dropdown with options
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} size={size} className={className}>
                    <Share2 className="w-4 h-4" />
                    {showLabel && <span className="ml-2">Distribuie</span>}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={copyToClipboard}>
                    {copied ? (
                        <Check className="w-4 h-4 mr-2 text-green-500" />
                    ) : (
                        <Link2 className="w-4 h-4 mr-2" />
                    )}
                    {copied ? 'Copiat!' : 'Copiază link'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={shareToTwitter}>
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter / X
                </DropdownMenuItem>
                <DropdownMenuItem onClick={shareToFacebook}>
                    <Facebook className="w-4 h-4 mr-2" />
                    Facebook
                </DropdownMenuItem>
                <DropdownMenuItem onClick={shareByEmail}>
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// Simple copy link button (alternative)
export function CopyLinkButton({ url, className = '' }: { url?: string; className?: string }) {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast({
                title: 'Link copiat!',
                description: 'Link-ul a fost copiat în clipboard.',
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    return (
        <Button variant="ghost" size="icon" className={className} onClick={copyToClipboard}>
            {copied ? (
                <Check className="w-4 h-4 text-green-500" />
            ) : (
                <Link2 className="w-4 h-4" />
            )}
            <span className="sr-only">Copiază link</span>
        </Button>
    );
}
