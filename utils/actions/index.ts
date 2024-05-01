"use server"

import supabaseServerClient from "../supabase/server"

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
            const token = await supabase
            .from('users')
            .select('cur_session')
            return token.data?.[0]?.cur_session || null;
        }
    }
}
