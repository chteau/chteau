// Dependencies
import type { Metadata, Viewport } from "next";
import { Rethink_Sans } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const BASE_URL = "https://chteau.bzh";

const rethinkSans = Rethink_Sans({
    subsets: ["latin"],
    variable: "--font-display",
    weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
    title: "Cheeteau | Portfolio",
    description: "Full-stack developer, familiar with Roblox, web development, and backend systems.",
    openGraph: {
        title: "Cheeteau | Portfolio",
        description: "Full-stack developer, familiar with Roblox, web development, and backend systems.",
        url: BASE_URL,
        siteName: "Cheeteau | Portfolio",
        images: [{ url: `${BASE_URL}/screen.png`, width: 1645, height: 984, alt: "Cheeteau Portfolio" }],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Cheeteau | Portfolio",
        description: "Full-stack developer, familiar with Roblox, web development, and backend systems.",
        images: [`${BASE_URL}/screen.png`],
    },
};

export const viewport: Viewport = {
    themeColor: "#05020c",
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
            <body className={`antialiased ${rethinkSans.variable}`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
