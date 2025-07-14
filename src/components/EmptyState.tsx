import { QrCode, PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

interface EmptyStateProps {
  onScan: () => void;
}

export function EmptyState({ onScan }: EmptyStateProps) {
  const { t } = useTranslation();
  return (
    <div className="text-center py-16 px-4">
      <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-5">
        <PackageSearch className="h-10 w-10 text-primary" />
      </div>
      <h3 className="mt-2 text-2xl font-medium font-headline text-foreground">{t('emptyListTitle')}</h3>
      <p className="mt-2 text-base text-muted-foreground max-w-md mx-auto">
        {t('emptyListDescription')}
      </p>
      <div className="mt-8">
          <Button onClick={onScan} size="lg">
            <QrCode className="mr-2 h-5 w-5" />
            {t('scanFirstItem')}
          </Button>
      </div>
    </div>
  );
}
