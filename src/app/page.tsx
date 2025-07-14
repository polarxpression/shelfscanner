
import { AppSidebar } from "@/components/AppSidebar";
import HomePage from "@/components/HomePage";
import { SidebarProvider } from "@/components/SidebarProvider";

export default function Home() {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          <HomePage />
        </main>
      </div>
    </SidebarProvider>
  );
}
