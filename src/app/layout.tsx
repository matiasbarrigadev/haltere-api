import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Haltere Club - Club Silencioso del Bienestar",
  description: "Enfocados en satisfacer las necesidades físicas e intelectuales que impulsan la autorrealización, cultivando un sentido de pertenencia a través de valores compartidos.",
  keywords: ["wellness", "fitness", "club privado", "entrenamiento personal", "bienestar", "Santiago", "Chile"],
  openGraph: {
    title: "Haltere Club - Club Silencioso del Bienestar",
    description: "Privacidad, excelencia y discreción en cada aspecto de nuestra experiencia.",
    type: "website",
    locale: "es_CL",
  },
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