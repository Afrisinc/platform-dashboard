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

type ActionType = "delete" | "danger" | "default";

interface ConfirmActionDialogProps {
  title: string;
  description: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  actionText?: string;
  type?: ActionType;
}

const typeStyles: Record<ActionType, string> = {
  delete: "bg-red-600 hover:bg-red-700",
  danger: "bg-red-600 hover:bg-red-700",
  default: "bg-blue-600 hover:bg-blue-700",
};

export function ConfirmActionDialog({
  title,
  description,
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading = false,
  actionText = "Confirm",
  type = "default",
}: ConfirmActionDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={typeStyles[type]}
          >
            {isLoading ? "Loading..." : actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
