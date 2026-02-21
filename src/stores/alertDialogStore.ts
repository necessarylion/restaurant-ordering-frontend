import { create } from "zustand";

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

interface AlertOptions {
  title: string;
  description: string;
  confirmLabel?: string;
}

interface DialogState {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive: boolean;
}

const INITIAL_DIALOG: DialogState = {
  open: false,
  title: "",
  description: "",
  confirmLabel: "OK",
  destructive: false,
};

let resolveRef: ((value: boolean) => void) | null = null;

interface AlertDialogState {
  dialog: DialogState;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions) => Promise<void>;
  close: (confirmed: boolean) => void;
}

export const useAlertDialogStore = create<AlertDialogState>((set) => ({
  dialog: INITIAL_DIALOG,

  confirm: (options) => {
    return new Promise<boolean>((resolve) => {
      resolveRef = resolve;
      set({
        dialog: {
          open: true,
          title: options.title,
          description: options.description,
          confirmLabel: options.confirmLabel ?? "Confirm",
          cancelLabel: options.cancelLabel ?? "Cancel",
          destructive: options.destructive ?? false,
        },
      });
    });
  },

  alert: (options) => {
    return new Promise<void>((resolve) => {
      resolveRef = () => resolve();
      set({
        dialog: {
          open: true,
          title: options.title,
          description: options.description,
          confirmLabel: options.confirmLabel ?? "OK",
          destructive: false,
        },
      });
    });
  },

  close: (confirmed) => {
    set({ dialog: INITIAL_DIALOG });
    resolveRef?.(confirmed);
    resolveRef = null;
  },
}));
