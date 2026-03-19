import "./globals.css";

export const metadata = {
  title: "ERPBridge",
  description: "One Bridge. All ERPs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}