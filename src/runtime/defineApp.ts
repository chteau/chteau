// Dependencies
import type { AppFactory, ChteauRuntime } from '../types/runtime';

/**
 * Wraps an app factory into a React component the OS shell can render.
 * The factory receives the injected `runtime` and returns the app's tree.
 *
 * @param factory - Pure function producing the app element from its runtime
 */
export function defineApp(
    factory: AppFactory
): React.FC<{ runtime: ChteauRuntime }> {
    const Component = ({ runtime }: { runtime: ChteauRuntime }) => factory({ runtime });

    Component.displayName = 'ChteauApp';
    return Component;
}
