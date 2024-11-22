export interface CustomNode {
    id: string;
    data: {
      label: string;
    };
    position?: {
      x: number;
      y: number;
    };
    style?: {
      background?: string;
      width?: number;
      height?: number;
      borderRadius?: string;
      opacity?: number;
    };
  }
  
  export interface CustomEdge {
    id: string;
    source: string;
    target: string;
    animated?: boolean;
    style?: {
      stroke?: string;
      opacity?: number;
    };
  }
  