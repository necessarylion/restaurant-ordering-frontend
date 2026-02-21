import { useAlertDialogStore } from "@/stores/alertDialogStore";

export const useAlertDialog = () => {
  const confirm = useAlertDialogStore((s) => s.confirm);
  const alert = useAlertDialogStore((s) => s.alert);
  return { confirm, alert };
};
