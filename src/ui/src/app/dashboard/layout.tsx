import { Navbar } from "@/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="border-t py-6 bg-background">
        <div className="container flex items-center justify-between px-4 sm:px-6 lg:px-8 text-sm text-muted-foreground">
          <p>© 2025 Soundwave Music. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}