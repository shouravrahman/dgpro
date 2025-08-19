// Error codes enum for consistency
export enum AppErrorCode {
    GENERIC_ERROR = 'GENERIC_ERROR',
    AUTH_ERROR = 'AUTH_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR',
    STRING_ERROR = 'STRING_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppError {
    message: string;
    code: AppErrorCode;
    statusCode: number;
    details?: unknown;
}

export class ErrorHandler {
    private static get isDevelopment() {
        return process.env.NODE_ENV === 'development';
    }

    static handle(error: unknown): AppError {
        if (error instanceof Error) {
            const { statusCode, code } = this.categorizeError(error);

            return {
                message: error.message,
                code,
                statusCode,
                details: this.isDevelopment ? error.stack : undefined,
            };
        }

        if (typeof error === 'string') {
            return {
                message: error,
                code: AppErrorCode.STRING_ERROR,
                statusCode: 500,
            };
        }

        return {
            message: 'An unexpected error occurred',
            code: AppErrorCode.UNKNOWN_ERROR,
            statusCode: 500,
            details: this.isDevelopment ? error : undefined,
        };
    }

    private static categorizeError(error: Error): { statusCode: number; code: AppErrorCode } {
        if (this.isAuthError(error)) {
            return { statusCode: 401, code: AppErrorCode.AUTH_ERROR };
        }

        if (this.isValidationError(error)) {
            return { statusCode: 400, code: AppErrorCode.VALIDATION_ERROR };
        }

        if (this.isNetworkError(error)) {
            return { statusCode: 503, code: AppErrorCode.NETWORK_ERROR };
        }

        return { statusCode: 500, code: AppErrorCode.GENERIC_ERROR };
    }

    static getErrorMessage(error: unknown): string {
        const appError = this.handle(error);
        return appError.message;
    }

    static isNetworkError(error: unknown): boolean {
        if (!(error instanceof Error)) return false;

        const message = error.message.toLowerCase();
        const networkKeywords = ['fetch', 'network', 'connection', 'timeout', 'offline'];

        return networkKeywords.some(keyword => message.includes(keyword));
    }

    static isAuthError(error: unknown): boolean {
        if (!(error instanceof Error)) return false;

        const message = error.message.toLowerCase();
        const authKeywords = ['auth', 'unauthorized', 'forbidden', 'token', 'session', 'login', 'credential'];

        return authKeywords.some(keyword => message.includes(keyword));
    }

    static isValidationError(error: unknown): boolean {
        if (!(error instanceof Error)) return false;

        const message = error.message.toLowerCase();
        const validationKeywords = ['validation', 'invalid', 'required', 'format', 'schema', 'parse'];

        return validationKeywords.some(keyword => message.includes(keyword));
    }
}

export function createErrorBoundaryFallback(error: Error, retry: () => void) {
    return {
        title: 'Something went wrong',
        message: error.message,
        action: {
            label: 'Try again',
            onClick: retry,
        },
    };
}