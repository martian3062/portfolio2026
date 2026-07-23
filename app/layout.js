import "./globals.css";

export const metadata = {
  title: "PARDEEP SINGH // FULL-STACK ENGINEER",
  description:
    "Portfolio for Pardeep Singh — full-stack developer and ML-automation engineer building clinical AI, agentic systems, and Web3 products. 5 IEEE papers; live internships at 4BaseCare and VECTRA International.",
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
