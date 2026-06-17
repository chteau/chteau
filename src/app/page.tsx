"use client";

// Dependencies
import dynamic from 'next/dynamic';

// Dynamically import the main Chateau App component with ssr: false 
// to prevent hydration issues with localStorage and window dimensions.
const App = dynamic(() => import('../App'), { ssr: false });

export default function Page() {
    return <App />;
}
