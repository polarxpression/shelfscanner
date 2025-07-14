"use client";

import type { InventoryItem as InventoryItemType } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Header } from '@/components/Header';
import { InventoryItem } from '@/components/InventoryItem';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const [inventory, setInventory] = useLocalStorage<InventoryItemType[]>('shelf-scanner-inventory', []);
  const { toast } = useToast();

  const generateRandomBarcode = () => {
    return `${Math.floor(100000000000 + Math.random() * 900000000000)}`;
  };

  const handleAddItem = () => {
    const newItem: InventoryItemType = {
      id: crypto.randomUUID(),
      barcode: generateRandomBarcode(),
      quantity: 1,
      shelfPosition: '',
    };
    setInventory([newItem, ...inventory]);
    toast({
      title: "Item Added",
      description: `Scanned barcode: ${newItem.barcode}`,
    });
  };

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
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header onExportJson={handleExportJson} onExportTxt={handleExportTxt} />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {inventory.length > 0 && (
          <div className="mb-6 text-center sm:text-left">
            <Button size="lg" onClick={handleAddItem} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <QrCode className="mr-2 h-5 w-5" />
              Scan New Item
            </Button>
          </div>
        )}

        {inventory.length === 0 ? (
          <EmptyState onScan={handleAddItem} />
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
  );
}
