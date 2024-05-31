export interface RuneTokenProperty {
    Runename: string;
    RemainAmount: number;
    currentPrice: number;
  }
  
 export interface RuneToken {
    RuneType: string;
    RuneId: string;
    Image: string;
    Property: RuneTokenProperty;
  }