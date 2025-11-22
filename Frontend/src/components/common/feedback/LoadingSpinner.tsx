import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/admin/skeleton";

type LoadingSpinnerProps = {
    className?: string;
    size?: "sm" | "md" | "lg";
    useSkeleton?: boolean;
    skeletonHeight?: number;
    skeletonWidth?: number;
};

export function LoadingSpinner({
    size = "md",
    className,
    useSkeleton = false,
    skeletonHeight,
    skeletonWidth,
    ...props
}: LoadingSpinnerProps & React.HTMLAttributes<HTMLDivElement>) {
    const sizeClasses = {
        sm: "size-4",
        md: "size-6",
        lg: "size-8",
    };

    if (useSkeleton) {
        return (
            <Skeleton
                className={cn("rounded-md", className)}
                style={{
                    height: skeletonHeight ? `${skeletonHeight}px` : '100%',
                    width: skeletonWidth ? `${skeletonWidth}px` : '100%'
                }}
            />
        );
    }

    return (
        <div
            className={cn("flex items-center justify-center", className)}
            {...props}
        >
            <Loader2
                className={cn(
                    "animate-spin text-primary",
                    sizeClasses[size]
                )}
            />
        </div>
    );
} 