import type { Metadata } from 'next';
import './globals.css';
import { CmsAuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'MyComplain CMS',
  description: 'Operations Dashboard for MyComplain',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <CmsAuthProvider>{children}</CmsAuthProvider>
      </body>
    </html>
  );
}
