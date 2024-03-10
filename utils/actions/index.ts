"use server"

import supabaseServerClient from "../supabase/server"

export default async function readUserSession(){
    const supabase = supabaseServerClient()
    return await supabase.auth.getSession()
}