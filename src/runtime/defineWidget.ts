import type { WidgetFactory } from '../types/widget';

/**
 * Identity wrapper that types a component as a WidgetFactory.
 * Mirrors defineApp — exists for consistency and future capability injection.
 */
export function defineWidget(factory: WidgetFactory): WidgetFactory {
    return factory;
}
