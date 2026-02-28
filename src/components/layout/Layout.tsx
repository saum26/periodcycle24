import { ReactNode } from 'react';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      {children}
    </main>
  );
}
