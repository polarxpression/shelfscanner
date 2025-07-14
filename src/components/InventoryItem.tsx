
"use client";

import { useState, useEffect } from 'react';
import type { InventoryItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MinusCircle, PlusCircle, Trash2, Barcode, Edit, MapPin } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

interface InventoryItemProps {
  item: InventoryItem;
  onUpdate: (id: string, updates: Partial<Omit<InventoryItem, 'id' | 'barcode'>>) => void;
  onDelete: (id: string) => void;
}

interface EditFormState {
    name: string;
    description: string;
    quantity: number;
    shelfColumn: string;
    shelfRow: string;
}

export function InventoryItem({ item, onUpdate, onDelete }: InventoryItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFormState, setEditFormState] = useState<EditFormState>({
    name: item.name,
    description: item.description,
    quantity: item.quantity,
    shelfColumn: '',
    shelfRow: '',
  });

  useEffect(() => {
    const [col, row] = item.shelfPosition.split('-');
    setEditFormState({
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        shelfColumn: col || '',
        shelfRow: row || '',
    })
  }, [item]);


  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(0, item.quantity + change);
    onUpdate(item.id, { quantity: newQuantity });
  };
  
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditFormState({ ...editFormState, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const shelfPosition = editFormState.shelfColumn && editFormState.shelfRow
        ? `${editFormState.shelfColumn}-${editFormState.shelfRow}`
        : '';
        
    onUpdate(item.id, {
      name: editFormState.name,
      description: editFormState.description,
      quantity: Number(editFormState.quantity) || 0,
      shelfPosition: shelfPosition,
    });
    setIsEditOpen(false);
  };
  
  const openEditDialog = () => {
    const [col, row] = item.shelfPosition.split('-');
    setEditFormState({
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        shelfColumn: col || '',
        shelfRow: row || '',
    });
    setIsEditOpen(true);
  }

  const [col, row] = item.shelfPosition.split('-');

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg flex flex-col">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
            <div className="font-mono text-sm text-primary font-semibold flex items-center">
                <Barcode className="mr-2 h-5 w-5 shrink-0" />
                <span className="truncate">{item.barcode}</span>
            </div>
            <div className='flex'>
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={openEditDialog}
                            aria-label={`Edit item ${item.name}`}
                            className="text-muted-foreground hover:text-primary hover:bg-primary/10 -mt-2 shrink-0"
                            >
                            <Edit className="h-5 w-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Item</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit}>
                            <div className="grid gap-4 py-4">
                               <div className="space-y-2">
                                    <Label htmlFor="name">Name (Optional)</Label>
                                    <Input id="name" name="name" value={editFormState.name} onChange={handleEditFormChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Textarea id="description" name="description" value={editFormState.description} onChange={handleEditFormChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Quantity</Label>
                                    <Input id="quantity" name="quantity" type="number" min="0" value={editFormState.quantity} onChange={handleEditFormChange} required />
                                </div>
                                <div className="space-y-2">
                                  <Label>Shelf Position (Optional)</Label>
                                  <div className="flex gap-2">
                                    <Input id="shelfColumn" name="shelfColumn" type="number" min="0" placeholder="Column" value={editFormState.shelfColumn} onChange={handleEditFormChange} />
                                    <Input id="shelfRow" name="shelfRow" type="number" min="0" placeholder="Row" value={editFormState.shelfRow} onChange={handleEditFormChange} />
                                  </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary">Cancel</Button>
                                </DialogClose>
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(item.id)}
                    aria-label={`Delete item ${item.name}`}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-2 shrink-0"
                >
                    <Trash2 className="h-5 w-5" />
                </Button>
            </div>
        </div>
        <CardTitle className="mt-2 text-lg">{item.name || 'Unnamed Item'}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
        {item.shelfPosition && (
          <div className="text-sm text-muted-foreground mt-2 flex items-center">
            <MapPin className="mr-1.5 h-4 w-4" />
            Column: {col}, Row: {row}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 flex-grow flex flex-col justify-end">
         <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label>Quantity</Label>
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
              <span className="font-bold text-lg w-10 text-center" aria-live="polite">
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
          <div className="space-y-2">
            <Label>Shelf Position</Label>
            <div className="flex items-center gap-2">
                <Input
                type="number"
                min="0"
                placeholder="Col"
                value={col || ''}
                onChange={(e) => onUpdate(item.id, { shelfPosition: `${e.target.value}-${row || ''}` })}
                />
                <Input
                type="number"
                min="0"
                placeholder="Row"
                value={row || ''}
                onChange={(e) => onUpdate(item.id, { shelfPosition: `${col || ''}-${e.target.value}` })}
                />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
