"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NetworkSelector } from "@/components/network-selector";
import { ContractInvoker } from "@/components/contract-invoker";
import { History } from "@/components/history";
import { ThemeToggle } from "@/components/theme-toggle";
import { Rocket } from "lucide-react";
import { WalletNetwork } from "@creit.tech/stellar-wallets-kit";
import Link from "next/link";

export function MainInterface() {
  const [network, setNetwork] = useState<WalletNetwork>(WalletNetwork.TESTNET);

  return (
    <div className="container mx-auto p-4">
      <header className="flex items-center justify-between mb-8">
        <Link href="/">
          <div className="flex items-center gap-2">
            <Rocket className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Stellar Contract Invoker</h1>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <NetworkSelector value={network} onValueChange={setNetwork} />
          <ThemeToggle />
        </div>
      </header>

      <Tabs defaultValue="explorer" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="explorer">Contract Invoker</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="explorer" className="space-y-4">
          <ContractInvoker network={network} />
        </TabsContent>

        <TabsContent value="history">
          <History />
        </TabsContent>
      </Tabs>
    </div>
  );
}
