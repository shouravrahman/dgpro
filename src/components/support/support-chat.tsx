'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  AlertCircle,
  RefreshCw,
  X,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSupportAgent } from '@/hooks/use-support-agent';
import type { SupportMessage } from '@/lib/ai/agents/support-agent';

interface SupportChatProps {
  userId?: string;
  userContext?: {
    subscriptionTier?: string;
    accountAge?: number;
    previousIssues?: string[];
    preferredLanguage?: string;
    timezone?: string;
  };
  onClose?: () => void;
  className?: string;
  minimized?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

export function SupportChat({
  userId,
  userContext,
  onClose,
  className = '',
  minimized = false,
  onMinimize,
  onMaximize,
}: SupportChatProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [urgency, setUrgency] = useState<string>('medium');
  const [category, setCategory] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearConversation,
    retryLastMessage,
    sessionId,
  } = useSupportAgent({
    userId,
    userContext,
    onError: (error) => {
      console.error('Support chat error:', error);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    await sendMessage(inputMessage, {
      urgency: urgency !== 'medium' ? urgency : undefined,
      category: category || undefined,
    });

    setInputMessage('');
  };

  const handleQuickAction = async (action: string) => {
    await sendMessage(action);
  };

  const formatMessageContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(
        /\[(.*?)\]\((.*?)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>'
      )
      .replace(/\n/g, '<br>');
  };

  const getMessageIcon = (role: SupportMessage['role']) => {
    switch (role) {
      case 'user':
        return <User className="w-4 h-4" />;
      case 'assistant':
        return <Bot className="w-4 h-4" />;
      case 'system':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getMessageBgColor = (role: SupportMessage['role']) => {
    switch (role) {
      case 'user':
        return 'bg-blue-500 text-white ml-auto';
      case 'assistant':
        return 'bg-gray-100 text-gray-900';
      case 'system':
        return 'bg-yellow-50 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-gray-50';
    }
  };

  if (minimized) {
    return (
      <Card className={`fixed bottom-4 right-4 w-80 shadow-lg ${className}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Support Chat
              {messages.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {messages.filter((m) => m.role === 'user').length}
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onMaximize}
                className="h-6 w-6 p-0"
              >
                <Maximize2 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card
      className={`fixed bottom-4 right-4 w-96 h-[600px] shadow-lg flex flex-col ${className}`}
    >
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Support Chat
            <Badge variant="outline" className="text-xs">
              Session: {sessionId.slice(-8)}
            </Badge>
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMinimize}
              className="h-8 w-8 p-0"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 gap-4">
        {/* Messages */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">
                  Hi! I'm here to help you with any questions or issues. How can
                  I assist you today?
                </p>
                <div className="mt-4 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleQuickAction('I need help with my account')
                    }
                    className="w-full text-xs"
                  >
                    Account Help
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleQuickAction('I have a technical issue')
                    }
                    className="w-full text-xs"
                  >
                    Technical Support
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleQuickAction('I have a billing question')
                    }
                    className="w-full text-xs"
                  >
                    Billing Question
                  </Button>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role !== 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {getMessageIcon(message.role)}
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${getMessageBgColor(message.role)}`}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formatMessageContent(message.content),
                    }}
                  />
                  {message.metadata?.confidence && (
                    <div className="mt-1 text-xs opacity-70">
                      Confidence:{' '}
                      {Math.round(message.metadata.confidence * 100)}%
                    </div>
                  )}
                  {message.metadata?.escalated && (
                    <Badge variant="destructive" className="mt-1 text-xs">
                      Escalated
                    </Badge>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    {getMessageIcon(message.role)}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>Error: {error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={retryLastMessage}
                className="ml-auto h-6 px-2"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="space-y-2">
          <div className="flex gap-2">
            <Select value={urgency} onValueChange={setUrgency}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Category (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Auto-detect</SelectItem>
                <SelectItem value="account_management">Account</SelectItem>
                <SelectItem value="billing_payment">Billing</SelectItem>
                <SelectItem value="technical_support">Technical</SelectItem>
                <SelectItem value="product_creation">Products</SelectItem>
                <SelectItem value="general_inquiry">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
              maxLength={5000}
            />
            <Button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>

        {/* Actions */}
        {messages.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearConversation}
              className="text-xs"
            >
              Clear Chat
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleQuickAction('Can you escalate this to a human agent?')
              }
              className="text-xs"
            >
              Human Agent
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
