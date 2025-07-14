"use client";

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, X, FileText } from 'lucide-react';
import { useSidebar } from './SidebarProvider';

export function AppSidebar() {
  const {
    lists,
    setLists,
    activeListId,
    setActiveListId,
    isMobile,
    openMobile,
    setOpenMobile,
  } = useSidebar();

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');

  const handleAddList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      const newList = { id: crypto.randomUUID(), name: newListName.trim(), items: [] };
      const updatedLists = [...lists, newList];
      setLists(updatedLists);
      setActiveListId(newList.id);
      setNewListName('');
      setIsAddingList(false);
    }
  };

  const handleDeleteList = (listId: string) => {
    const updatedLists = lists.filter(l => l.id !== listId);
    setLists(updatedLists);
    if (activeListId === listId) {
      setActiveListId(updatedLists.length > 0 ? updatedLists[0].id : null);
    }
  };

  const content = (
    <div className="flex flex-col h-full bg-card">
        <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold text-primary">ShelfScanner</h2>
             {isMobile && (
              <Button variant="ghost" size="icon" onClick={() => setOpenMobile(false)}>
                <X className="h-6 w-6" />
              </Button>
            )}
        </div>
      <div className="flex-grow p-2 overflow-y-auto">
        <div className="p-2">
            <Button onClick={() => setIsAddingList(true)} className="w-full">
            <Plus className="mr-2 h-4 w-4" /> New List
            </Button>
            {isAddingList && (
            <form onSubmit={handleAddList} className="mt-4 p-2 bg-muted rounded-md">
                <Label htmlFor="new-list-name" className="sr-only">List Name</Label>
                <Input
                id="new-list-name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Enter list name"
                className="mb-2"
                />
                <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingList(false)}>Cancel</Button>
                <Button type="submit" size="sm">Add</Button>
                </div>
            </form>
            )}
        </div>
        <nav className="flex flex-col gap-1 p-2">
          {lists.map(list => (
            <div key={list.id} className="group flex items-center">
              <Button
                variant={activeListId === list.id ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveListId(list.id)}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span className="truncate">{list.name}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 ml-1 opacity-0 group-hover:opacity-100"
                onClick={() => handleDeleteList(list.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="left" className="p-0 w-80 bg-card">
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="w-64 border-r md:block hidden shadow-md">
      {content}
    </aside>
  );
}
