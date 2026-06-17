// Dependencies
import type { Metadata } from "next";
import "./globals.css";

const BASE_URL = "https://chteau.bzh";

export const metadata: Metadata = {
    title: "Cheeteau | Portfolio",
    description: "Full-stack developer, familiar with Roblox, web development, and backend systems.",
    openGraph: {
        title: "Cheeteau | Portfolio",
        description: "Full-stack developer, familiar with Roblox, web development, and backend systems.",
        url: BASE_URL,
        siteName: "Cheeteau | Portfolio",
        images: [{ url: `${BASE_URL}/screen.png`, width: 1280, height: 720, alt: "Cheeteau Portfolio" }],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Cheeteau | Portfolio",
        description: "Full-stack developer, familiar with Roblox, web development, and backend systems.",
        images: [`${BASE_URL}/screen.png`],
    },
    themeColor: "#3a78d8",
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
