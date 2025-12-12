import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Endurawill - Affordable Estate Planning for Everyone",
  description: "Create legally-recognized wills, trusts, and healthcare directives in minutes. Secure your legacy and protect your loved ones with our easy-to-use estate planning platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#2563eb",
          colorBackground: "#ffffff",
          colorInputBackground: "#ffffff",
          colorInputText: "#1f2937",
          borderRadius: "0.5rem",
        },
        elements: {
          card: "shadow-2xl rounded-2xl",
          headerTitle: "text-2xl font-bold text-gray-900",
          headerSubtitle: "text-gray-600",
          formButtonPrimary: 
            "bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-3 transition-colors",
          footerActionLink: "text-blue-600 hover:text-blue-700 font-semibold",
          formFieldInput: "rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500",
        },
      }}
    >
      <html lang="en">
        <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
