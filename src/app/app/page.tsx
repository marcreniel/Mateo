import { useEffect } from 'react';
import { redirect }  from 'next/navigation';
import Image from 'next/image'
import readUserSession from '@/utils/actions';
import SignOut from './signOut';

export default async function Main() {
  const { data } = await readUserSession();
  
  if (!data.session) {
    redirect('/login');
  } else return (
    <main className="flex justify-center p-24">
      <div className="bg-white flex flex-col items-center p-8 rounded-lg max-w-md w-full">
        <Image src="/logo.png" alt="Logo" width={250} height={250}/>
        <button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow w-full mb-2">
            Send Test Email
        </button>
        <div className="flex justify-center mb-4">
          <span className="text-gray-500 mx-2">OR</span>
        </div>
        <SignOut/>
      </div>
    </main>
  );
}
