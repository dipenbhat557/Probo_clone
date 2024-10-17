export interface INRBalance {
    balance: number;
    locked: number;
}

export interface StockOption {
    quantity: number;
    locked: number;
}

export interface StockBalance {
    yes?: StockOption; 
    no?: StockOption;  
}
