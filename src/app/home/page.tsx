import { redirect } from 'next/navigation';
import { readUserSession } from '@/utils/actions';
import Navigation from './components/navbar';
import HomeContent from './components/homeContent';

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

    // Ping the avatar URL so Google can cache it (and display in the navbar)
    await fetch(avatar);

    return (
      <main className="bg-harvest-gold-100 h-screen">
        <Navigation props={navigationProps} />
        <HomeContent props={name}/>
      </main>
    );
  }
}
