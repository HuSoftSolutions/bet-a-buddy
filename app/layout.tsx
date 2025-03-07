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
			<head>
				<link rel="icon" href="/favicon.ico" sizes="any" />
			</head>
      <body>{children}</body>
    </html>
  );
}
