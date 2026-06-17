// Dependencies
import { ChteauIPC } from './ipc';

/**
 * Process-wide IPC bus shared by all running app instances.
 */
export const ipc = new ChteauIPC();
