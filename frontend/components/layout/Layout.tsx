import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const handleReset = () => {
    const event = new CustomEvent('resetChat');
    window.dispatchEvent(event);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <header className="fixed w-full z-10">
        <div className="glass-effect border-b border-gray-800/50">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 
                onClick={handleReset}
                className="text-3xl font-serif text-emerald-400 tracking-wide cursor-pointer hover:text-emerald-300 transition-colors"
              >
                SageMind
              </h1>
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleReset}
                className="text-gray-500 hover:text-emerald-400 transition-colors flex items-center gap-2 text-sm"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
                Reset
              </button>
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
