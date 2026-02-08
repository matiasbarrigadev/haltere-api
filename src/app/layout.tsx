import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Haltere API',
  description: 'Backend API for Haltere Mobile App - Club Haltere',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}