
"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, X, FileText, Sun, Moon } from 'lucide-react';
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

  const { setTheme, theme } = useTheme();
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const desktopContent = (
    <div className="flex flex-col h-full bg-card">
      <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-primary">ShelfScanner</h2>
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
      <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {mounted ? (
              <>
                {theme === 'dark' ? (
                  <Sun className="mr-2 h-4 w-4" />
                ) : (
                  <Moon className="mr-2 h-4 w-4" />
                )}
                <span className="ml-2">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </>
            ) : <div className="h-4 w-4 mr-2" />}
          </Button>
        </div>
    </div>
  );
  
  const mobileContent = (
    <div className="flex flex-col h-full bg-card">
       <SheetHeader className="p-4 border-b flex flex-row items-center justify-between">
          <SheetTitle className="text-xl font-bold text-primary">ShelfScanner</SheetTitle>
          <SheetClose>
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </SheetHeader>
      <div className="flex-grow p-2 overflow-y-auto">
        <div className="p-2">
            <Button onClick={() => setIsAddingList(true)} className="w-full">
            <Plus className="mr-2 h-4 w-4" /> New List
            </Button>
            {isAddingList && (
            <form onSubmit={handleAddList} className="mt-4 p-2 bg-muted rounded-md">
                <Label htmlFor="new-list-name-mobile" className="sr-only">List Name</Label>
                <Input
                id="new-list-name-mobile"
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
                onClick={() => {
                  setActiveListId(list.id);
                  setOpenMobile(false);
                }}
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
      <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {mounted ? (
              <>
                {theme === 'dark' ? (
                  <Sun className="mr-2 h-4 w-4" />
                ) : (
                  <Moon className="mr-2 h-4 w-4" />
                )}
                <span className="ml-2">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </>
            ) : <div className="h-4 w-4 mr-2" />}
          </Button>
        </div>
    </div>
  );

  if (!mounted) {
    return (
      <aside className="w-64 border-r md:block hidden shadow-md">
        {/* Skeleton loader or empty state */}
      </aside>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="left" className="p-0 w-80 bg-card" showCloseButton={false}>
          {mobileContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="w-64 border-r md:block hidden shadow-md">
      {desktopContent}
    </aside>
  );
}
