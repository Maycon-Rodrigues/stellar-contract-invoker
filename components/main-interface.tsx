"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContractInvoker } from "@/components/contract-invoker";
import { History } from "@/components/history";
import { ThemeToggle } from "@/components/theme-toggle";
import { Rocket, Wallet, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion"
import Link from "next/link";
import { walletKit } from "@/lib/stellar/wallet";
import { ISupportedWallet, WalletNetwork } from "@creit.tech/stellar-wallets-kit";
import { useWalletStore } from "@/store/wallet";
import { formatWallerAddresse } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";

export function MainInterface() {
  const { address, network, networkPassphrase, setAddress, setNetwork, setNetworkPassphrase } = useWalletStore();
  const kit = walletKit(networkPassphrase);
  const [activeTab, setActiveTab] = useState("explorer");

  async function connectWallet() {
    await kit.openModal({
      onWalletSelected: async (option: ISupportedWallet) => {
        kit.setWallet(option.id);
        const { address } = await kit.getAddress();
        const { network, networkPassphrase } = await kit.getNetwork();

        setAddress(address);
        setNetwork(network as WalletNetwork);
        setNetworkPassphrase(networkPassphrase as WalletNetwork);
      }
    });
  }

  useEffect(() => {
    let interval: NodeJS.Timeout

    async function checkNetwork() {
      try {
        const details = await kit.getNetwork();
        if (details && details.network !== networkPassphrase) {
          setNetwork(details.network as WalletNetwork);
          setNetworkPassphrase(details.networkPassphrase as WalletNetwork);
        }
      } catch (error) {
        console.error("Erro ao obter detalhes da rede:", error);
      } finally {
        interval = setTimeout(checkNetwork, 200);
      }
    }

    checkNetwork();

    return () => {
      if (interval) clearTimeout(interval);
    };
  }, [networkPassphrase]);

  return (
    <div className="min-h-screen bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <div className="container mx-auto px-4 py-6 animate-fade-in">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-slide-in">
          <div className="flex items-center gap-4">
            <Link href="/">
              <div className="bg-primary/10 p-3 rounded-2xl rotate-3 transition-transform hover:rotate-6 cursor-pointer">
                <Rocket className="h-8 w-8 text-primary" />
              </div>
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 cursor-pointer">
                  Stellar Contract Invoker
                </h1>
                <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">Beta</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Interact with smart contracts on the Stellar network
              </p>
            </div>
          </div>
          <div className="flex flex-row-reverse justify-end sm:flex-row items-center sm:items-center gap-4">
            <div className="flex items-center gap-4 bg-card/50 backdrop-blur-sm sm:p-2 rounded-2xl border shadow-sm">
              <Label className="hidden sm:inline">{network}</Label>
              <div className="h-6 w-px bg-border hidden sm:inline" />
              <ThemeToggle />
            </div>
            <Button
              onClick={connectWallet}
              variant="default"
              className="group flex flex-1 items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-all rounded-2xl h-[50px] px-6"
            >
              <Wallet className="h-4 w-4" />
              {address ? formatWallerAddresse(address) : "Connect Wallet"}
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-[400px] grid-cols-2 p-1 rounded-2xl bg-muted/50 backdrop-blur-sm">
              <TabsTrigger
                value="explorer"
                className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                Contract Explorer
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                History
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="explorer" className="space-y-6 animate-fade-in">
            <motion.div
              key="explorer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <ContractInvoker />
            </motion.div>
          </TabsContent>

          <TabsContent value="history" className="animate-fade-in">
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <History onExecute={() => setActiveTab("explorer")} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
