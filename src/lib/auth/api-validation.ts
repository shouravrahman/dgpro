import { createServerClient } from '@supabase/ssr';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function validateApiAuth(request: NextRequest) {
    try {
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        );

        const { data: { user }, error } = await supabase.auth.getUser();

        return { user, error, supabase };
    } catch (error) {
        return { user: null, error, supabase: null };
    }
}

export function createApiResponse(data: any, status: number = 200) {
    return Response.json(data, { status });
}

export function createErrorResponse(message: string, status: number = 400) {
    return Response.json({ error: message }, { status });
}