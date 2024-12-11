"use client";

import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function DevelopmentNotice() {
  return (
    <Alert variant="destructive" className="rounded-none border-x-0 border-t-0 px-6">
      <div className="container mx-auto flex items-center justify-center gap-2">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <AlertDescription className="text-sm text-red-500">
          This application is currently in development. Some features may not work as expected.
        </AlertDescription>
      </div>
    </Alert>
  );
}
