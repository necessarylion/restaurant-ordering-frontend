import { useAlertDialogStore } from "@/stores/alertDialogStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function AlertDialogRenderer() {
  const dialog = useAlertDialogStore((s) => s.dialog);
  const close = useAlertDialogStore((s) => s.close);

  return (
    <AlertDialog
      open={dialog.open}
      onOpenChange={(open) => {
        if (!open) close(false);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dialog.title}</AlertDialogTitle>
          <AlertDialogDescription>{dialog.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {dialog.cancelLabel && (
            <AlertDialogCancel onClick={() => close(false)}>
              {dialog.cancelLabel}
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            onClick={() => close(true)}
            className={
              dialog.destructive
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : undefined
            }
          >
            {dialog.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
