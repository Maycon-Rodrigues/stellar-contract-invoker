import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { WalletNetwork } from "@creit.tech/stellar-wallets-kit";
import JsonView from "@uiw/react-json-view";
import { lightTheme } from '@uiw/react-json-view/light';
import { vscodeTheme } from '@uiw/react-json-view/vscode';
import { useTheme } from "next-themes";
import { Button } from "./ui/button";

interface HistoryItem {
  contractId: string
  functionName: string
  networkPassphrase: WalletNetwork
  parameters: string[]
  timestamp: string
  status: string
  response?: object
}

interface HistoryItemModalProps {
  item: HistoryItem | null;
  onClose: () => void;
  onExecute: (item: HistoryItem) => void;
}

export function HistoryItemModal({ item, onClose, onExecute }: HistoryItemModalProps) {
  const { theme } = useTheme();
  
  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        {item && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {item.functionName}
                <span
                  className={`ml-3 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${item.status === "SUCCESS"
                    ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                >
                  {item.status}
                </span>
              </DialogTitle>
              <DialogDescription>
                Contract ID: {item.contractId}
                <br />
                Timestamp: {new Date(item.timestamp).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Parameters</h3>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-[200px]">
                    {JSON.stringify(item.parameters, null, 2)}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Response</h3>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-[200px]">
                    <JsonView
                      value={item.response}
                      style={
                        theme === "dark" || theme === "system"
                          ? vscodeTheme
                          : lightTheme
                      }
                      displayDataTypes={false}
                      objectSortKeys={false}
                    />
                  </pre>
                </div>
              </div>
            </div>
            <Button onClick={() => onExecute(item)}>Execute on Explorer</Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
