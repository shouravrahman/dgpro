import { NextRequest } from 'next/server';
import { ApiErrorHandler, parseRequestBody, withApiErrorHandler } from '@/lib/api-error-handler';

// Example of using the improved error handler
export const GET = withApiErrorHandler(async (request: NextRequest) => {
  // Product fetching logic will be implemented in later tasks
  return ApiErrorHandler.success([], 'Products API endpoint ready');
});

export const POST = withApiErrorHandler(async (request: NextRequest) => {
  const body = await parseRequestBody(request);

  // Product creation logic will be implemented in later tasks
  return ApiErrorHandler.created(body, 'Product creation endpoint ready');
});
