"use client";

import type { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { CHTEAUSDKProvider } from '../sdk/CHTEAUSDK';

/** Shared client providers for every route — i18n and the GitHub auth session (for blog comments). */
export default function Providers({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <CHTEAUSDKProvider>{children}</CHTEAUSDKProvider>
        </SessionProvider>
    );
}
