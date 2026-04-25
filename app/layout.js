import "./globals.css";

export const metadata = {
  title: "PARDEEP SINGH // FULL-STACK ENGINEER",
  description:
    "Portfolio for Pardeep Singh — full-stack engineer building AI systems, real-time platforms, and impossible products at the edge of code and science.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
