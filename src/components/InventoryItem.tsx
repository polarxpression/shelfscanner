
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
import { useTranslation } from '@/hooks/use-translation';

interface InventoryItemProps {
  item: InventoryItem;
  onUpdate: (id: string, updates: Partial<Omit<InventoryItem, 'id'>>) => void;
  onDelete: (id: string) => void;
}

interface EditFormState {
    barcode: string;
    name: string;
    description: string;
    quantity: number;
    shelfColumn: string;
    shelfRow: string;
}

export function InventoryItem({ item, onUpdate, onDelete }: InventoryItemProps) {
  const { t } = useTranslation();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFormState, setEditFormState] = useState<EditFormState>({
    barcode: item.barcode,
    name: item.name,
    description: item.description,
    quantity: item.quantity,
    shelfColumn: '',
    shelfRow: '',
  });

  useEffect(() => {
    const [col, row] = item.shelfPosition.split('-');
    setEditFormState({
        barcode: item.barcode,
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
    const { name, value } = e.target;
    if ((name === 'shelfColumn' || name === 'shelfRow') && value && !/^\d*$/.test(value)) return;
    setEditFormState({ ...editFormState, [name]: value });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const shelfPosition = editFormState.shelfColumn && editFormState.shelfRow
        ? `${editFormState.shelfColumn}-${editFormState.shelfRow}`
        : '';
        
    onUpdate(item.id, {
      barcode: editFormState.barcode,
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
        barcode: item.barcode,
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
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col">
      <CardHeader className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
            <div className="font-mono text-xs text-primary font-semibold flex items-center pt-1">
                <Barcode className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">{item.barcode}</span>
            </div>
            <div className='flex -mr-2 -mt-2'>
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={openEditDialog}
                            aria-label={`Edit item ${item.name}`}
                            className="text-muted-foreground hover:text-primary"
                            >
                            <Edit className="h-5 w-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('editItem')}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit}>
                            <div className="grid gap-4 py-4">
                               <div className="space-y-2">
                                    <Label htmlFor="barcode">{t('barcode')}</Label>
                                    <Input id="barcode" name="barcode" value={editFormState.barcode} onChange={handleEditFormChange} required />
                                </div>
                               <div className="space-y-2">
                                    <Label htmlFor="name">{t('nameOptional')}</Label>
                                    <Input id="name" name="name" value={editFormState.name} onChange={handleEditFormChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">{t('descriptionOptional')}</Label>
                                    <Textarea id="description" name="description" value={editFormState.description} onChange={handleEditFormChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">{t('quantity')}</Label>
                                    <Input id="quantity" name="quantity" type="number" min="0" value={editFormState.quantity} onChange={handleEditFormChange} required />
                                </div>
                                <div className="space-y-2">
                                  <Label>{t('shelfPositionOptional')}</Label>
                                  <div className="flex gap-2">
                                    <Input id="shelfColumn" name="shelfColumn" type="text" inputMode="numeric" pattern="[0-9]*" placeholder={t('column')} value={editFormState.shelfColumn} onChange={handleEditFormChange} />
                                    <Input id="shelfRow" name="shelfRow" type="text" inputMode="numeric" pattern="[0-9]*" placeholder={t('row')} value={editFormState.shelfRow} onChange={handleEditFormChange} />
                                  </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary">{t('cancel')}</Button>
                                </DialogClose>
                                <Button type="submit">{t('saveChanges')}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(item.id)}
                    aria-label={`Delete item ${item.name}`}
                    className="text-muted-foreground hover:text-destructive-foreground hover:bg-destructive"
                >
                    <Trash2 className="h-5 w-5" />
                </Button>
            </div>
        </div>
        <CardTitle className="mt-1 text-lg font-medium">{item.name || t('unnamedItem')}</CardTitle>
        <CardDescription className="text-sm">{item.description}</CardDescription>
        {item.shelfPosition && (
          <div className="text-sm text-muted-foreground mt-2 flex items-center">
            <MapPin className="mr-1.5 h-4 w-4" />
            {t('column')}: {col}, {t('row')}: {row}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-0 flex-grow flex flex-col justify-end">
         <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(-1)}
                disabled={item.quantity === 0}
                aria-label={t('decreaseQuantity')}
                className="h-9 w-9"
              >
                <MinusCircle className="h-5 w-5" />
              </Button>
              <span className="font-bold text-xl w-12 text-center" aria-live="polite">
                {item.quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(1)}
                aria-label={t('increaseQuantity')}
                className="h-9 w-9"
              >
                <PlusCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
      </CardContent>
    </Card>
  );
}
