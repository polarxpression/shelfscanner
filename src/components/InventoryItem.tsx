"use client";

import { useState } from 'react';
import type { InventoryItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MinusCircle, PlusCircle, Trash2, Barcode, Edit } from 'lucide-react';
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

export function InventoryItem({ item, onUpdate, onDelete }: InventoryItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFormState, setEditFormState] = useState<Omit<InventoryItem, 'id' | 'barcode'>>({
    name: item.name,
    description: item.description,
    quantity: item.quantity,
    shelfPosition: item.shelfPosition,
  });

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(0, item.quantity + change);
    onUpdate(item.id, { quantity: newQuantity });
  };
  
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditFormState({ ...editFormState, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(item.id, {
      ...editFormState,
      quantity: Number(editFormState.quantity) || 0,
    });
    setIsEditOpen(false);
  };
  
  const openEditDialog = () => {
    setEditFormState({
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        shelfPosition: item.shelfPosition,
    });
    setIsEditOpen(true);
  }

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
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" name="name" value={editFormState.name} onChange={handleEditFormChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea id="description" name="description" value={editFormState.description} onChange={handleEditFormChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Quantity</Label>
                                    <Input id="quantity" name="quantity" type="number" value={editFormState.quantity} onChange={handleEditFormChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shelfPosition">Shelf Position</Label>
                                    <Input id="shelfPosition" name="shelfPosition" value={editFormState.shelfPosition} onChange={handleEditFormChange} />
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
        <CardTitle className="mt-2 text-lg">{item.name}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
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
            <Label htmlFor={`shelf-${item.id}`}>Shelf Position</Label>
            <Input
              id={`shelf-${item.id}`}
              type="text"
              placeholder="e.g., Aisle 5, Shelf 3"
              value={item.shelfPosition}
              onChange={(e) => onUpdate(item.id, { shelfPosition: e.target.value })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
