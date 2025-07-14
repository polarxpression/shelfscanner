import { QrCode, PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


interface EmptyStateProps {
  onScan: () => void;
}

export function EmptyState({ onScan }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
        <PackageSearch className="h-8 w-8 text-primary" />
      </div>
      <h3 className="mt-5 text-xl font-semibold font-headline text-foreground">No items scanned</h3>
      <p className="mt-2 text-base text-muted-foreground max-w-md mx-auto">
        Get started by scanning your first item's barcode to add it to your inventory.
      </p>
      <div className="mt-6">
          <Button onClick={onScan} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <QrCode className="mr-2 h-5 w-5" />
            Scan First Item
          </Button>
      </div>
    </div>
  );
}
