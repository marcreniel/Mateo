"use server"

import supabaseServerClient from "../supabase/server"
import { google } from 'googleapis';


export async function readUserSession(){
    const supabase = supabaseServerClient()
    return await supabase.auth.getSession()
}

export async function getUserToken(){
    const supabase = supabaseServerClient()
    const { data:session } = await readUserSession();
    if(!session){
        return null
    } else {
        const id = session.session?.user.id
        const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', id)
        .single()

        if (existingUser) {
            const req = await supabase
            .from('users')
            .select('cur_session')
            return req.data?.[0]?.cur_session || null;
        }
    }
}

export async function refreshGoogleToken(){
    const supabase = supabaseServerClient()
    const { data:session } = await readUserSession();
    if(!session){
        return false
    } else {
        const id = session.session?.user.id
        const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', id)
        .single()

        if (existingUser) {
            const req = await supabase
            .from('users')
            .select('provider_refresh_token')
            const refreshToken = req.data?.[0]?.provider_refresh_token

            const auth = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
            );
            auth.setCredentials({ refresh_token: refreshToken });
            const newToken = await auth.refreshAccessToken();

            const { error: updateError } = await supabase
            .from('users')
            .update({ cur_session: newToken.credentials.access_token })
            .eq('id', id)

            if (updateError) {
                return false
            } 
            return true
        }
    }
}