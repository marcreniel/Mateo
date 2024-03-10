"use client"

import useSupabaseClient from "@/utils/supabase/client";
import { useRouter } from 'next/navigation'

export default function SignOut() {
    const supabase = useSupabaseClient();
    const router = useRouter()

    async function signOut() {
        await supabase.auth.signOut();
        router.push("/login")
    }

    return (
        <button onClick={signOut} className="bg-black hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded w-full">
            Sign Out
        </button>
    );
}
