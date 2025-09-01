import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function getCurrentUser() {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return null
        }

        return user
    } catch (error) {
        console.error('Error getting current user:', error)
        return null
    }
}

export async function requireAuth() {
    const user = await getCurrentUser()
    if (!user) {
        throw new Error('Authentication required')
    }
    return user
}