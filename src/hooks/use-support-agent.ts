import { useState, useCallback, useRef } from 'react';
import type { SupportRequest, SupportResponse, SupportMessage } from '@/lib/ai/agents/support-agent';

interface UseSupportAgentOptions {
    sessionId?: string;
    userId?: string;
    userContext?: SupportRequest['userContext'];
    onMessage?: (message: SupportMessage) => void;
    onError?: (error: Error) => void;
}

interface UseSupportAgentReturn {
    messages: SupportMessage[];
    isLoading: boolean;
    error: string | null;
    sendMessage: (message: string, options?: { urgency?: string; category?: string }) => Promise<void>;
    clearConversation: () => void;
    retryLastMessage: () => Promise<void>;
    sessionId: string;
}

export function useSupportAgent(options: UseSupportAgentOptions = {}): UseSupportAgentReturn {
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sessionIdRef = useRef(options.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    const lastMessageRef = useRef<{ message: string; options?: { urgency?: string; category?: string } } | null>(null);

    const addMessage = useCallback((message: SupportMessage) => {
        setMessages(prev => [...prev, message]);
        options.onMessage?.(message);
    }, [options]);

    const sendMessage = useCallback(async (
        message: string,
        messageOptions?: { urgency?: string; category?: string }
    ) => {
        if (!message.trim()) return;

        setIsLoading(true);
        setError(null);

        // Store for retry functionality
        lastMessageRef.current = { message, options: messageOptions };

        // Add user message
        const userMessage: SupportMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            role: 'user',
            content: message.trim(),
            timestamp: new Date()
        };
        addMessage(userMessage);

        try {
            const requestBody: Omit<SupportRequest, 'timestamp'> = {
                message: message.trim(),
                sessionId: sessionIdRef.current,
                userId: options.userId,
                conversationHistory: messages.slice(-10), // Last 10 messages for context
                userContext: options.userContext,
                urgency: messageOptions?.urgency as any,
                category: messageOptions?.category
            };

            const response = await fetch('/api/agents/support', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            const supportResponse: SupportResponse = await response.json();

            if (!supportResponse.success) {
                throw new Error(supportResponse.error || 'Support agent failed to process request');
            }

            // Add assistant message
            const assistantMessage: SupportMessage = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                role: 'assistant',
                content: supportResponse.message,
                timestamp: new Date(),
                metadata: {
                    confidence: supportResponse.confidence,
                    category: supportResponse.category,
                    escalated: supportResponse.escalationRequired,
                    resolved: false
                }
            };
            addMessage(assistantMessage);

            // Add system message with additional info if available
            if (supportResponse.suggestedActions?.length ||
                supportResponse.followUpQuestions?.length ||
                supportResponse.relatedArticles?.length) {

                const systemInfo = [];

                if (supportResponse.suggestedActions?.length) {
                    systemInfo.push(`**Suggested Actions:**\n${supportResponse.suggestedActions.map(action => `• ${action}`).join('\n')}`);
                }

                if (supportResponse.followUpQuestions?.length) {
                    systemInfo.push(`**Follow-up Questions:**\n${supportResponse.followUpQuestions.map(q => `• ${q}`).join('\n')}`);
                }

                if (supportResponse.relatedArticles?.length) {
                    systemInfo.push(`**Related Articles:**\n${supportResponse.relatedArticles.map(article => `• [${article.title}](${article.url})`).join('\n')}`);
                }

                if (supportResponse.estimatedResolutionTime) {
                    systemInfo.push(`**Estimated Resolution Time:** ${supportResponse.estimatedResolutionTime}`);
                }

                if (systemInfo.length > 0) {
                    const systemMessage: SupportMessage = {
                        id: `sys_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        role: 'system',
                        content: systemInfo.join('\n\n'),
                        timestamp: new Date(),
                        metadata: {
                            escalated: supportResponse.escalationRequired
                        }
                    };
                    addMessage(systemMessage);
                }
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
            setError(errorMessage);
            options.onError?.(err instanceof Error ? err : new Error(errorMessage));

            // Add error message
            const errorSystemMessage: SupportMessage = {
                id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                role: 'system',
                content: `**Error:** ${errorMessage}\n\nPlease try again or contact support directly if the issue persists.`,
                timestamp: new Date()
            };
            addMessage(errorSystemMessage);
        } finally {
            setIsLoading(false);
        }
    }, [messages, options, addMessage]);

    const retryLastMessage = useCallback(async () => {
        if (!lastMessageRef.current) return;

        const { message, options: messageOptions } = lastMessageRef.current;
        await sendMessage(message, messageOptions);
    }, [sendMessage]);

    const clearConversation = useCallback(() => {
        setMessages([]);
        setError(null);
        sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        lastMessageRef.current = null;
    }, []);

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        clearConversation,
        retryLastMessage,
        sessionId: sessionIdRef.current
    };
}