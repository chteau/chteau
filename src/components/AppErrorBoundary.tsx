"use client";

// Dependencies
import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Props for the per-app crash isolation boundary.
 */
interface AppErrorBoundaryProps {
    pid: number;
    appId: string;
    /** Notifies the OS so it can flag the process as crashed. */
    onCrash: (pid: number) => void;
    children: ReactNode;
}

interface AppErrorBoundaryState {
    hasError: boolean;
    message: string;
}

/**
 * Isolates a single app's render so a thrown error degrades to a contained
 * crash panel instead of taking down the whole desktop. On catch it reports
 * the pid upward so the process is marked `crashed` in the manager.
 *
 * @example
 * <AppErrorBoundary pid={3} appId="notepad" onCrash={markCrashed}>
 *   <NotepadApp runtime={runtime} />
 * </AppErrorBoundary>
 */
export default class AppErrorBoundary extends Component<
    AppErrorBoundaryProps,
    AppErrorBoundaryState
> {
    /**
     * Initializes the AppErrorBoundary component with the specified props.
     * @param props - Configuration inputs for the error boundary
     */
    constructor(props: AppErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, message: '' };
    }

    /**
     * Updates state so that the next render will show the fallback UI.
     * @param error - The error that was thrown
     * @returns An object with the updated state
     */
    static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
        return { hasError: true, message: error.message || 'Unknown fault' };
    }

    /**
     * Logs error information and flags the process as crashed.
     * @param error - The error that was thrown
     * @param info - Information about the error, including the component stack
     */
    componentDidCatch(error: Error, info: ErrorInfo): void {
        console.error(
            `[ChteauOS] App "${this.props.appId}" (pid ${this.props.pid}) crashed:`,
            error,
            info.componentStack
        );
        this.props.onCrash(this.props.pid);
    }

    /**
     * Renders the error boundary.
     * @returns The error boundary component
     */
    render(): ReactNode {
        const { hasError, message } = this.state;
        const { pid, appId } = this.props;
        if (hasError) {
            return (
                <div
                    className="flex flex-col items-center justify-center h-full w-full bg-black text-on-surface font-mono p-6 text-center select-text"
                    id={`app-crash-${pid}`}
                >
                    <AlertTriangle
                        size={28}
                        className="text-red-500 mb-3 animate-pulse shrink-0"
                    />
                    <h2 className="text-xs font-black uppercase tracking-widest text-red-500 mb-2">
                        PROCESS FAULT // {appId.toUpperCase()}
                    </h2>
                    <p className="text-[10px] text-on-surface-variant max-w-xs leading-relaxed mb-3">
                        The application encountered an unrecoverable error and was halted to
                        protect the operating system.
                    </p>
                    <pre className="text-[9px] text-red-400/80 bg-red-950/20 border border-red-900/40 p-2 max-w-xs overflow-x-auto whitespace-pre-wrap wrap-break-word">
                        {message}
                    </pre>
                    <div className="mt-4 text-[8px] text-on-surface/30 uppercase tracking-widest">
                        PID_{pid} // STATUS: CRASHED
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
