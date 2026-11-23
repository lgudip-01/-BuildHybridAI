import type { ChatBridge } from '@clause-guard/core/chat';
import type { AiBridge } from '@clause-guard/core/types';
import { useScroller } from './motion';
import { Footer } from './ui/Footer';
import { Hero } from './ui/Hero';
import { HowItWorks } from './ui/HowItWorks';
import { Nav } from './ui/Nav';
import { Workbench } from './Workbench';

// The review cards live with the tool; they stay importable from here.
export { AnalysisResults } from './Workbench';

type Bridge = AiBridge & { downloadModel(onProgress: (fraction: number) => void): Promise<void> };

/** The whole page: hero, how it works, then the working tool. Sections live in ./ui, the tool in ./Workbench. */
export function App({ bridge, chatBridge }: { bridge: Bridge; chatBridge?: ChatBridge }) {
  useScroller();
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Workbench bridge={bridge} chatBridge={chatBridge} />
      </main>
      <Footer />
    </>
  );
}
