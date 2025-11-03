declare module "react-simple-maps" {
  import type { ComponentType, ReactNode } from "react";

  export const ComposableMap: ComponentType<{
    geography?: string | object;
    projectionConfig?: Record<string, unknown>;
    style?: Record<string, unknown>;
    width?: number;
    height?: number;
    children?: ReactNode;
  }>;

  export const Geographies: ComponentType<{
    geography: string | object;
    children: (params: { geographies: Array<Record<string, any>> }) => ReactNode;
  }>;

  export const Geography: ComponentType<{
    geography: Record<string, any>;
    style?: Record<string, any>;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
  }>;
}
