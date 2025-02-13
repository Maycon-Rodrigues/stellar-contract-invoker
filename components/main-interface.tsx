"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NetworkSelector } from "@/components/network-selector";
import { ContractInvoker } from "@/components/contract-invoker";
import { History } from "@/components/history";
import { ThemeToggle } from "@/components/theme-toggle";
import { Rocket } from "lucide-react";
import Link from "next/link";

export function MainInterface() {
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
          <NetworkSelector />
          <ThemeToggle />
        </div>
      </header>

      <Tabs defaultValue="explorer" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="explorer">Contract Invoker</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="explorer" className="space-y-4">
          <ContractInvoker />
        </TabsContent>

        <TabsContent value="history">
          <History />
        </TabsContent>
      </Tabs>
    </div>
  );
}
