"use client";

import Image from 'next/image'
import useSupabaseClient from '@/utils/supabase/client';

export default async function Login() {
  const supabase = useSupabaseClient()

  const loginWithGoogle = () => {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        scopes: 'https://www.googleapis.com/auth/gmail.modify',
      },
    });
  };
  
  return (
    <main className="flex justify-center p-24">
      <div className="bg-white flex flex-col items-center p-8 rounded-lg max-w-md w-full">
        <Image src="/logo.png" alt="Logo" width={250} height={250}/>
        <button onClick={loginWithGoogle} className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow w-full mb-2">
          Continue with Google
        </button>
        <div className="flex justify-center mb-4">
          <span className="text-gray-500 mx-2">OR</span>
        </div>
        <button className="bg-black hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded w-full">
          Continue with Microsoft
        </button>
      </div>
    </main>
  );
}
