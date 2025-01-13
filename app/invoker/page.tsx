import { MainInterface } from "@/components/main-interface";
import { DevelopmentNotice } from "@/components/development-notice";

export default function Test() {
  return (
    <main className="min-h-screen bg-background">
      <DevelopmentNotice />
      <MainInterface />
    </main>
  );
}
