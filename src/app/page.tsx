import { MacbookScroll } from "./components/macbook-scroll";
import { StickyScroll } from "./components/sticky-scroll-reveal";

export default function Home() {
  return (
    <main className="flex flex-col justify-center bg-harvest-gold-100">
      <MacbookScroll src="/landing.png" />
      <StickyScroll />
    </main>
  );
}
