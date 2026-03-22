import "./globals.css";

export const metadata = {
  title: "ERPBridge",
  description: "Business Intelligence for Indian Businesses",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f5c842" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script dangerouslySetInnerHTML={{
          __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', function() { navigator.serviceWorker.register('/sw.js'); }); }`
        }} />
      </head>
      <body className="bg-gray-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}