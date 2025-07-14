"use client";

import { Download, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from './SidebarProvider';
import { useTranslation } from '@/hooks/use-translation';

interface HeaderProps {
  onExportJson: () => void;
  onExportTxt: () => void;
  listName: string;
}

export function Header({ onExportJson, onExportTxt, listName }: HeaderProps) {
  const { t } = useTranslation();
  const { setOpenMobile } = useSidebar();
  return (
    <header className="bg-card shadow-md sticky top-0 z-10 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setOpenMobile(true)}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">{t('openMenu')}</span>
            </Button>
            <h1 className="text-xl font-medium font-headline text-foreground truncate">
              {listName}
            </h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                {t('export')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onExportJson}>
                {t('exportAsJson')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportTxt}>
                {t('exportAsTxt')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
