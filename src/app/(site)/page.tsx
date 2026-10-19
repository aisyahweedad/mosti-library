import { Faq } from "@/components/faq";
import { Hero } from "@/components/hero";
import { ThesisCatalog } from "@/components/thesis-catalog";

export default function Home() {
  return (
    <main>
      <Hero />
      <ThesisCatalog />
      <Faq />
    </main>
  );
}
