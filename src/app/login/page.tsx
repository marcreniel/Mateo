"use client";

import Image from 'next/image'
import GoogleLoginButton from "./googleLogin";

export default async function Login() {  
  return (
    <main className="flex justify-center p-24">
      <div className="bg-white flex flex-col items-center p-8 rounded-lg max-w-md w-full">
        <Image src="/logo.png" alt="Logo" width={250} height={250}/>
        <GoogleLoginButton />
      </div>
    </main>
  );
}
