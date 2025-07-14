"use client";

import { useState, useEffect } from 'react';
import type { InventoryItem as InventoryItemType, InventoryList } from '@/types';
import { useSidebar } from '@/components/SidebarProvider';
import { Header } from '@/components/Header';
import { InventoryItem } from '@/components/InventoryItem';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCode, BookType } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import { BarcodeScanner } from '@/components/BarcodeScanner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';

export default function HomePage() {
  const { lists, setLists, activeListId, setActiveListId } = useSidebar();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const { toast } = useToast();

  const activeList = lists.find(l => l.id === activeListId);

  const handleAddItem = (barcode: string) => {
    if (!activeList) {
      toast({ title: "No list selected", description: "Please create or select a list first.", variant: "destructive" });
      return;
    }

    if (!barcode) {
      toast({
        title: "Invalid Barcode",
        description: "The scanned or entered barcode is empty.",
        variant: "destructive",
      });
      return;
    }

    const newItem: InventoryItemType = {
      id: crypto.randomUUID(),
      barcode: barcode,
      quantity: 1,
      shelfPosition: '',
      name: `Product ${barcode.slice(-4)}`,
      description: 'A brief description of the product can go here.'
    };
    
    const updatedLists = lists.map(list => {
        if (list.id === activeListId) {
            return { ...list, items: [newItem, ...list.items] };
        }
        return list;
    });
    setLists(updatedLists);

    toast({
      title: "Item Added",
      description: `Scanned barcode: ${barcode}`,
    });
    setIsScannerOpen(false);
    setIsManualAddOpen(false);
    setManualBarcode('');
  };
  
  const handleOpenManualAdd = () => {
    setIsScannerOpen(false); 
    setIsManualAddOpen(true);
  }

  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddItem(manualBarcode);
  }

  const handleUpdateItem = (id: string, updates: Partial<Omit<InventoryItemType, 'id' | 'barcode'>>) => {
    if (!activeList) return;
    const updatedLists = lists.map(list => {
        if (list.id === activeListId) {
            const updatedItems = list.items.map((item) => (item.id === id ? { ...item, ...updates } : item));
            return { ...list, items: updatedItems };
        }
        return list;
    });
    setLists(updatedLists);
  };

  const handleDeleteItem = (id: string) => {
    if (!activeList) return;
    const updatedLists = lists.map(list => {
        if (list.id === activeListId) {
            const updatedItems = list.items.filter((item) => item.id !== id);
            return { ...list, items: updatedItems };
        }
        return list;
    });
    setLists(updatedLists);

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
    if (!activeList || activeList.items.length === 0) {
      toast({ title: "Nothing to export", description: "Your inventory is empty.", variant: "destructive" });
      return;
    }
    const dataToExport = activeList.items.map(({ barcode, shelfPosition, quantity, name, description }) => ({
      barcode,
      shelfPosition,
      quantity,
      name,
      description
    }));
    const jsonContent = JSON.stringify(dataToExport, null, 2);
    downloadFile(`${activeList.name}_inventory.json`, jsonContent, 'application/json');
    toast({ title: "Export Successful", description: "Inventory JSON has been downloaded." });
  };

  const handleExportTxt = () => {
    if (!activeList || activeList.items.length === 0) {
      toast({ title: "Nothing to export", description: "Your inventory is empty.", variant: "destructive" });
      return;
    }
    const txtContent = activeList.items
      .map(({ barcode, quantity, name }) => `${barcode} - ${name}: ${quantity}`)
      .join('\n');
    downloadFile(`${activeList.name}_inventory.txt`, txtContent, 'text/plain');
    toast({ title: "Export Successful", description: "Inventory TXT has been downloaded." });
  };

  if (!activeList) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header onExportJson={handleExportJson} onExportTxt={handleExportTxt} listName="No List Selected" />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
            <div className="text-center">
                <BookType className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-semibold">No Inventory List Selected</h2>
                <p className="mt-2 text-muted-foreground">Please create a new list or select an existing one from the sidebar.</p>
            </div>
        </main>
      </div>
    )
  }

  return (
    <>
      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <div className="flex flex-col min-h-screen bg-background text-foreground">
          <Header onExportJson={handleExportJson} onExportTxt={handleExportTxt} listName={activeList.name} />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeList.items.length > 0 && (
              <div className="mb-6 text-center sm:text-left">
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <QrCode className="mr-2 h-5 w-5" />
                    Scan New Item
                  </Button>
                </DialogTrigger>
              </div>
            )}

            {activeList.items.length === 0 ? (
              <EmptyState onScan={() => setIsScannerOpen(true)} />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {activeList.items.map((item) => (
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
          <BarcodeScanner onScan={handleAddItem} onManualAdd={handleOpenManualAdd} />
        </DialogContent>
      </Dialog>

      <Dialog open={isManualAddOpen} onOpenChange={setIsManualAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Item Manually</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleManualAddSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="barcode" className="text-right">
                  Barcode
                </Label>
                <Input
                  id="barcode"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter barcode number"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit">Add Item</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
