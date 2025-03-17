import { Card, CardContent } from "@/components/ui/card";
import { useHistoryStore } from "@/store/history";
import { HistoryItemModal } from "./history-item-modal";
import { useState } from "react";
import { WalletNetwork } from "@creit.tech/stellar-wallets-kit";

interface HistoryItem {
  contractId: string;
  functionName: string;
  networkPassphrase: WalletNetwork;
  parameters: string[];
  timestamp: string;
  status: string;
}

export function History() {
  const { histories } = useHistoryStore()
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  return (
    <div className="space-y-4">
      {histories.length === 0 ? (
        <div className="flex flex-col text-lg font-bold justify-center items-center">
          <span>No history found.</span>
          <span>Start your first interaction with the Stellar Contract Invoker.</span>
        </div>
      ) : (
        <>
          <h2 className="text-lg font-bold justify-center align-center">My history in the Stellar Contract Invoker</h2>
          {histories.map((item) => (
            <Card key={item.timestamp}
              className="transition-all hover:shadow-md cursor-pointer"
              onClick={() => setSelectedItem(item)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm text-muted-foreground">Function: <span className="text-lg text-white font-semibold">{item.functionName}</span></h3>
                    <p className="text-sm text-muted-foreground truncate w-[200px] overflow-hidden sm:w-auto sm:overflow-visible sm:truncate-none">
                      Contract: {item.contractId}
                    </p>
                    <p className="py-1 text-sm text-white">{item.networkPassphrase.split(";", 1)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                    <span
                      className={`text-sm ${item.status === "SUCCESS"
                        ? "text-green-500"
                        : "text-red-500"
                        }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )).reverse()}
        </>
      )}

      <HistoryItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />

    </div>

  );
}
