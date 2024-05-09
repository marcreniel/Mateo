/* Supabase Actions are functions that interact with the Supabase client. 
They are used to perform operations like reading user sessions, getting user tokens, and refreshing Google tokens. 
These actions are used in the Google login component and the login page to handle user authentication and authorization. */

"use server";

import supabaseServerClient from "../supabase/server"
import { google } from 'googleapis';

// Read the user session
export async function readUserSession(){
    const supabase = supabaseServerClient()
    return await supabase.auth.getSession()
}

// Get the user token
export async function getUserToken(){
    const supabase = supabaseServerClient()
    const { data:session } = await readUserSession();
    // Checks if the user is logged in, if not return null, else get the user's provider token and return it
    if(!session){
        return null
    } else {
        const id = session.session?.user.id
        // Check if the user's UUID already exists in the database
        const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', id)
        .single()

        if (existingUser) {
            // Get the user's token from db
            const req = await supabase
            .from('users')
            .select('cur_session')
            return req.data?.[0]?.cur_session || null;
        }
        // TO-DO - Add error handling
    }
}

// Refresh the Google token if it's expired
export async function refreshGoogleToken(){
    const supabase = supabaseServerClient()
    const { data:session } = await readUserSession();
    // Checks if the user is logged in, if not return false, else get the user's provider refresh token and refresh the token
    if(!session){
        // TO-DO - Add error handling
        return false
    } else {
        const id = session.session?.user.id
        // Check if the user's UUID already exists in the database
        const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', id)
        .single()
        // If the user exists, refresh the token
        if (existingUser) {
            // Get the user's refresh token from db
            const req = await supabase
            .from('users')
            .select('provider_refresh_token')
            const refreshToken = req.data?.[0]?.provider_refresh_token

            // Create an OAuth2 client, append refresh token
            const auth = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
            );
            auth.setCredentials({ refresh_token: refreshToken });

            // Get new access token from refresh token
            const newToken = await auth.refreshAccessToken();

            // Update the user ID  with the new token
            const { error: updateError } = await supabase
            .from('users')
            .update({ cur_session: newToken.credentials.access_token })
            .eq('id', id)

            if (updateError) {
                return false
                // TO-DO - Add error handling
            } 
            return true
        }
    }
}