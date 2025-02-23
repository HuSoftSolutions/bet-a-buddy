// app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "Bet A Buddy",
  description: "The Ultimate Sports Betting Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
