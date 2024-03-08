"use server"

import useSupabaseClient from '../supabase/client'

export default async function readUserSession() {
    const supabase = useSupabaseClient()
    return supabase.auth.getSession()
}