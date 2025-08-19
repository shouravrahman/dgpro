import { toast } from 'sonner';

interface ToastProps {
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
}

export function useToast() {
    return {
        toast: ({ title, description, variant = 'default' }: ToastProps) => {
            if (variant === 'destructive') {
                toast.error(title || 'Error', {
                    description,
                });
            } else {
                toast.success(title || 'Success', {
                    description,
                });
            }
        },
    };
}