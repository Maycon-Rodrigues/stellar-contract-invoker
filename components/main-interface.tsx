"use client";

import { useState } from "react";
import { formatWallerAddresse } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NetworkSelector } from "@/components/network-selector";
import { ContractInvoker } from "@/components/contract-invoker";
import { History } from "@/components/history";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Rocket, Wallet } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import useStellarWalletsKit from "@/hooks/useStellarWalletKit";
import { ISupportedWallet } from "@creit.tech/stellar-wallets-kit";

export function MainInterface() {
  const [network, setNetwork] = useState("testnet");
  const [address, setAddress] = useState<string>("");
  const { toast } = useToast();
  const kit = useStellarWalletsKit();


  const handleConnectWallet = async () => {
    try {
      // Here we would implement actual wallet connection logic
      await kit.openModal({
        onWalletSelected: async (option: ISupportedWallet) => {
          kit.setWallet(option.id);
          const { address } = await kit.getAddress();
          // Do something else
          console.log("Address: ", address);
          setAddress(address);

          if (address.length > 0) {
            toast({
              title: "Wallet Connected",
              description: "Successfully connected to your Stellar wallet",
            });
          }
        },
        onClosed: (error: Error) => {
          toast({
            title: "Connection Failed",
            description: `Failed to connect to wallet ${error}`,
            variant: "destructive",
          });
        }
      });

    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to wallet",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Rocket className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Stellar Contract Invoker</h1>
        </div>
        <div className="flex items-center gap-4">
          <NetworkSelector value={network} onValueChange={setNetwork} />
          <Button
            variant="outline"
            onClick={handleConnectWallet}
            className="flex items-center gap-2"
          >
            <Wallet className="h-4 w-4" />
            {address ? formatWallerAddresse(address) : "Connect Wallet"}
          </Button>
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
