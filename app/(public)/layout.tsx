import { Navbar } from '@/app/components/public/Navbar';
import { Footer } from '@/app/components/public/Footer';

export const dynamic = 'force-dynamic';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen min-w-0 overflow-x-clip flex flex-col">
      <Navbar />
      <main className="min-w-0 flex-1">{children}</main>
      <Footer />
    </div>
  );
}
