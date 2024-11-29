import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <header className="fixed w-full z-10">
        <div className="glass-effect border-b border-gray-800/50">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-serif text-emerald-400 tracking-wide">Aurelius</h1>
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
            </div>
            <div className="flex items-center gap-4">
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto max-w-4xl pt-20 h-screen">
        {children}
      </main>
    </div>
  );
};
