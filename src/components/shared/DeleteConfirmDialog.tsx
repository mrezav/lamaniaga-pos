import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";
import React from "react";

interface DeleteConfirmProps {
    title?: string;
    description?: string;
    isDeleting: boolean;
    onConfirm: () => void;
    triggerButton: React.ReactNode;
}

export function DeleteConfirmDialog({
    title,
    description,
    isDeleting,
    onConfirm,
    triggerButton,
}: DeleteConfirmProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{triggerButton}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="hover:cursor-pointer">
                        Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-pink-500 hover:bg-pink-600 hover:cursor-pointer text-white"
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin"></Loader2>
                        ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Hapus
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
