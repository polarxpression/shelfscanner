"use client";

import type { InventoryItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MinusCircle, PlusCircle, Trash2, Barcode } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface InventoryItemProps {
  item: InventoryItem;
  onUpdate: (id: string, updates: Partial<Omit<InventoryItem, 'id' | 'barcode'>>) => void;
  onDelete: (id: string) => void;
}

export function InventoryItem({ item, onUpdate, onDelete }: InventoryItemProps) {
  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(0, item.quantity + change);
    onUpdate(item.id, { quantity: newQuantity });
  };

  const handleShelfPositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(item.id, { shelfPosition: e.target.value });
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg flex flex-col">
      <CardContent className="p-4 sm:p-6 flex-grow flex flex-col">
        <div className="flex items-start justify-between">
          <div className="flex items-center font-mono text-primary font-semibold text-sm">
            <Barcode className="mr-2 h-5 w-5 shrink-0" />
            <span className="truncate">{item.barcode}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(item.id)}
            aria-label={`Delete item ${item.barcode}`}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-2 -mr-2 shrink-0"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 flex-grow">
          <div className="space-y-2">
            <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(-1)}
                disabled={item.quantity === 0}
                aria-label="Decrease quantity"
              >
                <MinusCircle className="h-5 w-5" />
              </Button>
              <span id={`quantity-${item.id}`} className="font-bold text-lg w-10 text-center" aria-live="polite">
                {item.quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(1)}
                aria-label="Increase quantity"
              >
                <PlusCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="space-y-2 mt-auto">
            <Label htmlFor={`shelf-${item.id}`}>Shelf Position</Label>
            <Input
              id={`shelf-${item.id}`}
              type="text"
              placeholder="e.g., Aisle 5, Shelf 3"
              value={item.shelfPosition}
              onChange={handleShelfPositionChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
