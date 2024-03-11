import { redirect } from 'next/navigation';
import Image from 'next/image'
import readUserSession from '@/utils/actions';
import SignOut from './components/signOut';
import TestEmail from './components/TestEmailClient';

export default async function Home() {
  const { data:session } = await readUserSession();
    
  if (!session.session) {
    redirect('/login');
  } else return (
    <main className="flex justify-center p-24">
      <div className="bg-white flex flex-col items-center p-8 rounded-lg max-w-md w-full">
        <Image src="/logo.png" alt="Logo" width={250} height={250}/>
        <TestEmail/>
        <div className="flex justify-center mb-4">
          <span className="text-gray-500 mx-2">OR</span>
        </div>
        <SignOut/>
      </div>
    </main>
  );
}
