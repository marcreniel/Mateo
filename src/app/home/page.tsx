import { redirect } from 'next/navigation';
import { readUserSession } from '@/utils/actions';
import {Textarea} from "@nextui-org/react";
import {Button} from "@nextui-org/react";
import Navigation from './components/Navbar';
import SendIcon from './components/SendIcon';
import ArrowUp from './components/ArrowUp';

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
        <div className="flex flex-col pt-12 h-max space-y-32">
          <div className="flex flex-col items-center text-center justify-center">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tighter drop-shadow-md tracking-tight mb-4" data-aos="zoom-y-out">Welcome back, </h1>
            <h2 className="text-5xl bg-clip-text font-bold text-transparent bg-gradient-to-b drop-shadow-md from-harvest-gold-600 to-harvest-gold-800">Marc Bernardino</h2>
          </div>

        </div>
        <div className="flex flex-row items-center justify-center space-x-5 fixed bottom-0 w-full p-8">
          <Textarea variant="underlined" color="primary" minRows={1.5} placeholder="Tell me how I can help your inbox!" value="test" className="max-w-96 drop-shadow-md"/>
          <Button isIconOnly size="lg" className="bg-gradient-to-b drop-shadow-lg from-harvest-gold-600 to-harvest-gold-800"><SendIcon/></Button>
        </div>
      </main>
    );
  }
}
