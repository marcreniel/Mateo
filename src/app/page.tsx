import { MacbookScroll } from "./components/macbook-scroll";
import { StickyScroll } from "./components/sticky-scroll-reveal";
import Navigation from "./components/navbar";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col justify-center bg-harvest-gold-100">
      <Navigation />
      <MacbookScroll src="/landing.png" />
      <StickyScroll />
      <footer className="w-full py-4 bg-harvest-gold-100">
      <div className="container mx-auto text-center">
        <p className="text-gray-600 ">
          made with <span className="text-red-500">❤️</span> in 🌁 by <Link href="http://notmarc.me">marc</Link>
        </p>
      </div>
    </footer>
    </main>
  );
}
