// Types
type IPCListener = (data: unknown) => void;

/**
 * Lightweight in-process message bus connecting running app instances.
 *
 * Channel keys are namespaced per-pid (`${pid}:${channel}`) so a message
 * targeted at a specific process never leaks into another. A bare `channel`
 * key is reserved for system-wide broadcasts.
 */
export class ChteauIPC {
    private listeners: Map<string, Set<IPCListener>> = new Map();

    /**
     * Directed send: delivers `data` to every listener the target pid
     * registered on `channel`.
     * 
     * @param pid - The target process ID
     * @param channel - The channel name
     * @param data - The data to send
     */
    send(pid: number, channel: string, data: unknown): void {
        const key = `${pid}:${channel}`;
        const set = this.listeners.get(key);
        if (!set) return;

        // Snapshot avoids mutation-during-iteration if a handler unsubscribes itself.
        for (const cb of Array.from(set)) {
            cb(data);
        }
    }

    /**
     * Subscribes a specific pid to a channel. Returns an unsubscribe fn.
     * Apps never call this directly — `buildRuntime` closes over their pid
     * and exposes it as `runtime.os.ipc.on(channel, cb)`.
     * 
     * @param pid - The target process ID
     * @param channel - The channel name
     * @param cb - The callback function
     * @returns {() => void} - An unsubscribe function
     */
    onFor(pid: number, channel: string, cb: IPCListener): () => void {
        const key = `${pid}:${channel}`;

        let set = this.listeners.get(key);
        if (!set) {
            set = new Set();
            this.listeners.set(key, set);
        }

        set.add(cb);

        return () => {
            const current = this.listeners.get(key);
            if (!current) return;
            current.delete(cb);
            if (current.size === 0) this.listeners.delete(key);
        };
    }

    /**
     * Emits on the bare (un-namespaced) channel key for system-wide listeners.
     * 
     * @param channel - The channel name
     * @param data - The data to send
     */
    broadcast(channel: string, data: unknown): void {
        const set = this.listeners.get(channel);
        if (!set) return;

        for (const cb of Array.from(set)) {
            cb(data);
        }
    }

    /**
     * Removes every subscription owned by a pid. Called when a process closes
     * so dead listeners cannot leak memory or receive stale messages.
     * 
     * @param pid - The target process ID
     */
    cleanup(pid: number): void {
        const prefix = `${pid}:`;

        for (const key of Array.from(this.listeners.keys())) {
            if (key.startsWith(prefix)) {
                this.listeners.delete(key);
            }
        }
    }
}
