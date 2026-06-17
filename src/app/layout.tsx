// Dependencies
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Cheeteau",
    description: "Simulation de système d'exploitation gothique fine art portfolio.",
};

/**
 * RootLayout Component
 * 
 * @param {React.ReactNode} children - Children Components
 */
export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
