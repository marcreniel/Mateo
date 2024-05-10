import { MacbookScroll } from "./components/macbook-scroll";
import { StickyScroll } from "./components/sticky-scroll-reveal";
import Navigation from "./components/navbar";

export default function Home() {
  return (
    <main className="flex flex-col justify-center bg-harvest-gold-100">
      <Navigation />
      <MacbookScroll src="/landing.png" />
      <StickyScroll />
    </main>
  );
}
