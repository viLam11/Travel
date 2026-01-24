import {
    AlertDialog as ShadcnAlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AlertDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    variant?: "success" | "error" | "warning" | "info";
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    showIcon?: boolean;
    className?: string;
}

export function AlertDialog({
    open,
    onOpenChange,
    title,
    description,
    variant = "info",
    confirmText = "Continue",
    cancelText = "Cancel",
    showCancel = true,
    onConfirm,
    onCancel,
    confirmVariant = "default",
    showIcon = true,
    className,
}: AlertDialogProps) {
    const getIcon = () => {
        switch (variant) {
            case "success":
                return <CheckCircle2 className="size-5" />;
            case "error":
                return <XCircle className="size-5" />;
            case "warning":
                return <AlertTriangle className="size-5" />;
            case "info":
            default:
                return <Info className="size-5" />;
        }
    };

    const getIconColor = () => {
        switch (variant) {
            case "success":
                return "text-green-500 dark:text-green-400";
            case "error":
                return "text-red-500 dark:text-red-400";
            case "warning":
                return "text-amber-500 dark:text-amber-400";
            case "info":
            default:
                return "text-blue-500 dark:text-blue-400";
        }
    };

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        onOpenChange(false);
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
        onOpenChange(false);
    };

    return (
        <ShadcnAlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className={cn("sm:max-w-[425px]", className)}>
                <AlertDialogHeader>
                    <div className="flex items-center gap-2">
                        {showIcon && (
                            <div className={cn(getIconColor())}>
                                {getIcon()}
                            </div>
                        )}
                        <AlertDialogTitle>{title}</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    {showCancel && (
                        <AlertDialogCancel onClick={handleCancel}>
                            {cancelText}
                        </AlertDialogCancel>
                    )}
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className={cn(
                            variant === "error" && confirmVariant === "default" && "bg-red-500 hover:bg-red-600"
                        )}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </ShadcnAlertDialog>
    );
} 