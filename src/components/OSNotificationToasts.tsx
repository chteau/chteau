"use client";

// Dependencies
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCHTEAUSDK } from '../sdk/CHTEAUSDK';
import { Info, AlertTriangle, CheckCircle, Terminal, X } from 'lucide-react';
import { ToastMessage } from '../types';

/**
 * Controller to resolve the graphic icon matching the notification profile.
 *
 * @param {ToastMessage['type']} type - Severity or intent category
 * @returns {React.ReactNode} - Graphic symbol
 */
function getToastIcon(type: ToastMessage['type']): React.ReactNode {
    switch (type) {
        case 'error':
            return <AlertTriangle size={18} className="text-red-500 animate-pulse" />;
        case 'success':
            return <CheckCircle size={18} className="text-emerald-400" />;
        case 'system':
            return <Terminal size={18} className="text-primary-container" />;
        default:
            return <Info size={18} className="text-sky-400" />;
    }
}

/**
 * Toast theme visual container boundaries.
 *
 * @param {ToastMessage['type']} type - Visual categories 
 * @returns {string} - Combined tailwind class style mappings
 */
function getToastBorderClass(type: ToastMessage['type']): string {
    switch (type) {
        case 'error':
            return 'border-[#ffb4ab] bg-red-950/95 shadow-[0_0_12px_rgba(215,0,21,0.3)]';
        case 'success':
            return 'border-[#a7f3d0] bg-[#0c2419]/95';
        case 'system':
            return 'border-primary-container bg-black/95';
        default:
            return 'border-outline bg-black/95';
    }
}

/**
 * Multi-notification stacked toast layout system. Displays real-time alerts in bottom-right corner.
 *
 * @example
 * <OSNotificationToasts />
 *
 * @returns {React.ReactElement} - Interactive overlay containing alerts
 */
export default function OSNotificationToasts() {
    const { toasts, removeToast } = useCHTEAUSDK();

    return (
        <div
            className="fixed bottom-12 right-4 z-99999 pointer-events-none flex flex-col gap-2.5 max-w-85 w-full"
            id="os-notifications-stack"
        >
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: 30, scale: 0.95, x: 20 }}
                        animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                        transition={{ type: 'spring', damping: 20, stiffness: 220 }}
                        className={`pointer-events-auto border-2 rounded-none p-3.5 flex gap-3.5 items-start font-mono text-left select-text relative shadow-[4px_4px_0_black] ${getToastBorderClass(
                            toast.type
                        )}`}
                    >
                        {/* Left aligned graphic status icon */}
                        <div className="shrink-0 pt-0.5" id={`toast-icon-${toast.id}`}>
                            {getToastIcon(toast.type)}
                        </div>

                        {/* Middle explanatory metadata segments */}
                        <div className="grow pr-4 space-y-1" id={`toast-body-${toast.id}`}>
                            <h4 className="text-[11px] font-black uppercase text-white tracking-widest leading-none">
                                {toast.title}
                            </h4>
                            <p className="text-[9.5px] leading-tight text-on-surface-variant/90">
                                {toast.description}
                            </p>
                        </div>

                        {/* Quick close button */}
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="absolute top-1.5 right-1.5 p-0.5 text-on-surface/40 hover:text-white transition-colors cursor-pointer"
                            title="Close notification"
                            id={`toast-close-${toast.id}`}
                        >
                            <X size={12} strokeWidth={2.5} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
