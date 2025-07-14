"use client";

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onExportJson: () => void;
  onExportTxt: () => void;
}

export function Header({ onExportJson, onExportTxt }: HeaderProps) {
  return (
    <header className="bg-card shadow-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold font-headline text-primary">
            ShelfScanner
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onExportJson}>
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportTxt}>
                Export as TXT
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
