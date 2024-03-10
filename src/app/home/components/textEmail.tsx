"use client"

import { createClient } from "@/utils/supabase/client";
export default async function TestEmail() {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser()
    const info = data.user?.id
    
    
    async function testEmail() {
        const data = await fetch('/api/testEmail')
        const {emails} = await data.json()
    }
    
    return (
        <button onClick={testEmail} className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow w-full mb-2">
            Send Test Email
        </button>
    );
}
