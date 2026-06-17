export interface WidgetManifest {
    id: string;
    name: string;
    icon: string;
    description: string;
    defaultPosition: { x: number; y: number };
    defaultSize: { width: number; height: number };
    defaultAnchor?: 'bottom-right';
}

export interface WidgetInstanceState {
    x: number;
    y: number;
    visible: boolean;
}

export type WidgetManagerState = Record<string, WidgetInstanceState>;

export type WidgetManagerAction =
    | { type: 'SHOW_WIDGET'; widgetId: string }
    | { type: 'HIDE_WIDGET'; widgetId: string }
    | { type: 'TOGGLE_WIDGET'; widgetId: string }
    | { type: 'MOVE_WIDGET'; widgetId: string; x: number; y: number }
    | { type: 'INIT'; state: WidgetManagerState };

export type WidgetProps = {
    widgetId: string;
};

export type WidgetFactory = (props: WidgetProps) => React.JSX.Element;
