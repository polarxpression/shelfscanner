export interface InventoryItem {
  id: string;
  barcode: string;
  name: string;
  description: string;
  quantity: number;
  shelfPosition: string;
}

export interface InventoryList {
  id: string;
  name: string;
  items: InventoryItem[];
}
