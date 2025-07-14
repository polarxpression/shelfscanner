"use client";

import { useState } from 'react';
import type { InventoryItem as InventoryItemType } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Header } from '@/components/Header';
import { InventoryItem } from '@/components/InventoryItem';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { BarcodeScanner } from '@/components/BarcodeScanner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function Home() {
  const [inventory, setInventory] = useLocalStorage<InventoryItemType[]>('shelf-scanner-inventory', []);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { toast } = useToast();

  const handleAddItem = (barcode: string) => {
    const newItem: InventoryItemType = {
      id: crypto.randomUUID(),
      barcode: barcode,
      quantity: 1,
      shelfPosition: '',
    };
    setInventory([newItem, ...inventory]);
    toast({
      title: "Item Added",
      description: `Scanned barcode: ${barcode}`,
    });
    setIsScannerOpen(false);
  };
  
  const handleManualAdd = () => {
    const randomBarcode = `${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    handleAddItem(randomBarcode);
  }

  const handleUpdateItem = (id: string, updates: Partial<Omit<InventoryItemType, 'id' | 'barcode'>>) => {
    setInventory(
      inventory.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleDeleteItem = (id: string) => {
    setInventory(inventory.filter((item) => item.id !== id));
    toast({
      title: "Item Removed",
      description: "The item has been removed from your inventory.",
    });
  };

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    if (inventory.length === 0) {
      toast({ title: "Nothing to export", description: "Your inventory is empty.", variant: "destructive" });
      return;
    }
    const dataToExport = inventory.map(({ barcode, shelfPosition }) => ({
      barcode,
      shelfPosition,
    }));
    const jsonContent = JSON.stringify(dataToExport, null, 2);
    downloadFile('inventory.json', jsonContent, 'application/json');
    toast({ title: "Export Successful", description: "inventory.json has been downloaded." });
  };

  const handleExportTxt = () => {
    if (inventory.length === 0) {
      toast({ title: "Nothing to export", description: "Your inventory is empty.", variant: "destructive" });
      return;
    }
    const txtContent = inventory
      .map(({ barcode, quantity }) => `${barcode}: ${quantity}`)
      .join('\n');
    downloadFile('inventory.txt', txtContent, 'text/plain');
    toast({ title: "Export Successful", description: "inventory.txt has been downloaded." });
  };

  return (
    <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header onExportJson={handleExportJson} onExportTxt={handleExportTxt} />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {inventory.length > 0 && (
            <div className="mb-6 text-center sm:text-left">
              <DialogTrigger asChild>
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <QrCode className="mr-2 h-5 w-5" />
                  Scan New Item
                </Button>
              </DialogTrigger>
            </div>
          )}

          {inventory.length === 0 ? (
            <EmptyState onScan={() => setIsScannerOpen(true)} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {inventory.map((item) => (
                <InventoryItem
                  key={item.id}
                  item={item}
                  onUpdate={handleUpdateItem}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          )}
        </main>
      </div>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Scan Barcode</DialogTitle>
        </DialogHeader>
        <BarcodeScanner onScan={handleAddItem} onManualAdd={handleManualAdd} />
      </DialogContent>
    </Dialog>
  );
}
