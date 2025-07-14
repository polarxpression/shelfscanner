
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
import { Textarea } from '@/components/ui/textarea';

const defaultItemState = {
    name: '',
    description: '',
    quantity: 1,
    shelfPosition: '',
};

export default function HomePage() {
  const { lists, setLists, activeListId, setActiveListId } = useSidebar();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);
  const [isAddItemDetailOpen, setIsAddItemDetailOpen] = useState(false);
  
  const [manualBarcode, setManualBarcode] = useState('');
  const [newItemBarcode, setNewItemBarcode] = useState('');
  const [newItemDetails, setNewItemDetails] = useState<Omit<InventoryItemType, 'id' | 'barcode'>>(defaultItemState);

  const { toast } = useToast();

  const activeList = lists.find(l => l.id === activeListId);

  const handleScanned = (barcode: string) => {
    if (!activeList) {
      toast({ title: "No list selected", description: "Please create or select a list first.", variant: "destructive" });
      setIsScannerOpen(false);
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
    setNewItemBarcode(barcode);
    setNewItemDetails({ ...defaultItemState, name: `Product ${barcode.slice(-4)}` });
    setIsScannerOpen(false);
    setIsAddItemDetailOpen(true);
  };
  
  const handleOpenManualAdd = () => {
    setIsScannerOpen(false); 
    setIsManualAddOpen(true);
  }

  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsManualAddOpen(false);
    handleScanned(manualBarcode);
    setManualBarcode('');
  }

  const handleNewItemDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewItemDetails({ ...newItemDetails, [e.target.name]: e.target.value });
  };
  
  const handleNewItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if (!activeList) {
      toast({ title: "No list selected", description: "Please create or select a list first.", variant: "destructive" });
      return;
    }

    const newItem: InventoryItemType = {
      id: crypto.randomUUID(),
      barcode: newItemBarcode,
      ...newItemDetails,
      quantity: Number(newItemDetails.quantity) || 0,
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
      description: `Item with barcode ${newItem.barcode} has been added.`,
    });
    
    setIsAddItemDetailOpen(false);
    setNewItemBarcode('');
    setNewItemDetails(defaultItemState);
  };

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
    const dataToExport = activeList.items.reduce((acc, item) => {
      const position = item.shelfPosition || "unassigned";
      if (!acc[position]) {
        acc[position] = [];
      }
      for (let i = 0; i < item.quantity; i++) {
        acc[position].push({ barcode: item.barcode });
      }
      return acc;
    }, {} as Record<string, { barcode: string }[]>);

    const jsonContent = JSON.stringify(dataToExport, null, 4);
    downloadFile(`${activeList.name}_inventory.json`, jsonContent, 'application/json');
    toast({ title: "Export Successful", description: "Inventory JSON has been downloaded." });
  };

  const handleExportTxt = () => {
    if (!activeList || activeList.items.length === 0) {
      toast({ title: "Nothing to export", description: "Your inventory is empty.", variant: "destructive" });
      return;
    }
    const txtContent = activeList.items
      .map(({ barcode, quantity, name }) => `${barcode} - ${name || 'Unnamed Item'}: ${quantity}`)
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
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header onExportJson={handleExportJson} onExportTxt={handleExportTxt} listName={activeList.name} />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
                <Dialog open={isManualAddOpen} onOpenChange={setIsManualAddOpen}>
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
                            <Button type="submit">Continue</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Scan Barcode</DialogTitle>
                </DialogHeader>
                <BarcodeScanner onScan={handleScanned} onManualAdd={handleOpenManualAdd} />
                </DialogContent>
            </Dialog>
        </main>
      </div>

      <Dialog open={isAddItemDetailOpen} onOpenChange={setIsAddItemDetailOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Add New Item Details</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleNewItemSubmit}>
                  <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                          <Label>Barcode</Label>
                          <Input value={newItemBarcode} disabled />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="name">Name (Optional)</Label>
                          <Input id="name" name="name" value={newItemDetails.name} onChange={handleNewItemDetailChange} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="description">Description (Optional)</Label>
                          <Textarea id="description" name="description" value={newItemDetails.description} onChange={handleNewItemDetailChange} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="quantity">Quantity</Label>
                          <Input id="quantity" name="quantity" type="number" value={newItemDetails.quantity} onChange={handleNewItemDetailChange} required />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="shelfPosition">Shelf Position (Optional)</Label>
                          <Input id="shelfPosition" name="shelfPosition" value={newItemDetails.shelfPosition} onChange={handleNewItemDetailChange} />
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
