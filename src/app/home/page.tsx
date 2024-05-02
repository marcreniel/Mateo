import { redirect } from 'next/navigation';
import { readUserSession } from '@/utils/actions';
import Navigation from './components/Navbar';
import TestEmail from './components/TestEmailClient';

export default async function Home() {
  // Get the user session and check if the user is logged in
  const { data:session } = await readUserSession();
  if (!session.session) {
    redirect('/login');
  } else {
    // Get the user's email, name, and avatar, then pass as props to navbar
    const email = session.session.user.email;
    const name = session.session.user.user_metadata.full_name;
    const avatar = session.session.user.user_metadata.avatar_url;
    const navigationProps = {email, name, avatar};

    // Ping the avatar URL to cache it
    await fetch(avatar);

    return (
      <main className="bg-harvest-gold-100 h-screen">
        <Navigation props={navigationProps} />
        <div className="bg-white flex flex-col items-center p-8 rounded-lg max-w-md w-full">
          <TestEmail/>
        </div>
      </main>
    );
  }
}
