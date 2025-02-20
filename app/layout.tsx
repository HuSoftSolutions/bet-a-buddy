// app/layout.tsx
import { Karantina } from 'next/font/google';
import './globals.css';

// Initialize Orbitron font
const orbitron = Karantina({
  subsets: ['latin'],
  weight: ['300', '400', '700'], // You can specify weights if you need
});

export const metadata = {
  title: 'Bet A Buddy',
  description: 'The Ultimate Sports Betting Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${orbitron.className} antialiased`}>
      {/* <body> */}
        {children}
      </body>
    </html>
  );
}
