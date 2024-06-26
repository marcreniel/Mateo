"use client";

import useSupabaseClient from "@/utils/supabase/client";

export default function GoogleLoginButton() {
    // Initialize the Supabase client
    const supabase = useSupabaseClient();

    // Handles the Google login
    const handleGoogleLogin = async () => {
        supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${location.origin}/api/auth/callback`,
              scopes: 'https://www.googleapis.com/auth/gmail.modify',
            queryParams: {
                access_type: 'offline',
                },
            },
          });
    };

    return (
    <button
        onClick={handleGoogleLogin}
        className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow w-full mb-2"
    >
        Continue with Google
    </button>
    );
}