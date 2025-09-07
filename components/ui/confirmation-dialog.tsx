import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/useTranslation";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  locale?: string;
}

export function ConfirmationDialog({ open, onOpenChange, onConfirm, title, description, locale = 'ar' }: ConfirmationDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">{description}</div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel', locale)}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {t('common.confirm', locale)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 