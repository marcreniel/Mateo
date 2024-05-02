"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image'
import GoogleLoginButton from "./components/googleLogin";
import useSupabaseClient from "@/utils/supabase/client";

export default async function Login() {  
  // Initialize the Supabase client and router
  const supabase = useSupabaseClient();
  const router = useRouter();
  
  // Check if the user is already logged in
  useEffect(() => {
    const checkUserAndRedirect = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push("/home");
      }
    };

    checkUserAndRedirect();
  }, []);

  return (
    <main className="flex justify-center p-24">
      <div className="bg-white flex flex-col items-center p-8 rounded-lg max-w-md w-full">
        <Image src="/logo.png" alt="Logo" width={250} height={250}/>
        <GoogleLoginButton />
      </div>
    </main>
  );
}
