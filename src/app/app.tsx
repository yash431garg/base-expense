"use client";

import dynamic from "next/dynamic";
import { APP_NAME } from "~/lib/constants";
import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import { base } from "viem/chains";


// note: dynamic import is required for components that use the Frame SDK
const Demo = dynamic(() => import("~/components/Demo"), {
  ssr: false,
});

export default function App(
  { title }: { title?: string } = { title: APP_NAME }
) {



  return (<MiniKitProvider
    apiKey="brjawGEjy1QV1OF9EB5lo2TxNj435b1v"
    chain={base}
  >
    <Demo title={title} />
  </MiniKitProvider>);
}
