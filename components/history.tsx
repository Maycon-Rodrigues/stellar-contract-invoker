"use client";

import { Card, CardContent } from "@/components/ui/card";

export function History() {
  // Mock history data
  const historyItems = [
    {
      id: 1,
      contractId: "GABCD...",
      functionName: "transfer",
      timestamp: "2024-02-14T12:00:00Z",
      status: "success",
    },
    {
      id: 2,
      contractId: "GDEFG...",
      functionName: "mint",
      timestamp: "2024-02-14T11:30:00Z",
      status: "error",
    },
  ];

  return (
    <div className="space-y-4 opacity-35">
      <h2 className="text-lg font-bold justify-center align-center">This is a page that is still under development</h2>
      {historyItems.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{item.functionName}</h3>
                <p className="text-sm text-muted-foreground">
                  Contract: {item.contractId}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
                <span
                  className={`text-sm ${item.status === "success"
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
      ))}
    </div>
  );
}
