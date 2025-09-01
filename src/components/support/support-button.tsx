'use client';

import React from 'react';
import { MessageCircle, X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupportContext } from './support-provider';

interface SupportButtonProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showBadge?: boolean;
  badgeText?: string;
}

export function SupportButton({
  className = '',
  position = 'bottom-right',
  showBadge = false,
  badgeText = 'Help',
}: SupportButtonProps) {
  const { isOpen, isMinimized, toggleSupport } = useSupportContext();

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      default:
        return 'bottom-4 right-4';
    }
  };

  const getIcon = () => {
    if (isOpen && !isMinimized) {
      return <X className="w-5 h-5" />;
    }
    if (isOpen && isMinimized) {
      return <Minimize2 className="w-5 h-5" />;
    }
    return <MessageCircle className="w-5 h-5" />;
  };

  const getButtonText = () => {
    if (isOpen && !isMinimized) {
      return 'Close Support';
    }
    if (isOpen && isMinimized) {
      return 'Open Support';
    }
    return 'Get Help';
  };

  return (
    <div className={`fixed z-50 ${getPositionClasses()} ${className}`}>
      <div className="relative">
        <Button
          onClick={toggleSupport}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-blue-600 hover:bg-blue-700"
          size="lg"
          title={getButtonText()}
        >
          {getIcon()}
        </Button>

        {showBadge && badgeText && !isOpen && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 text-xs px-2 py-1 animate-pulse"
          >
            {badgeText}
          </Badge>
        )}

        {isOpen && isMinimized && (
          <Badge
            variant="secondary"
            className="absolute -top-2 -right-2 text-xs px-1 py-0.5"
          >
            •
          </Badge>
        )}
      </div>
    </div>
  );
}
