import { type FC, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
    className?: string;
    children: ReactNode;
    withPadding?: boolean;
    /**
     * Maximum width of the container
     * - xs: max-w-screen-xs (480px)
     * - sm: max-w-screen-sm (640px)
     * - md: max-w-screen-md (768px)
     * - lg: max-w-screen-lg (1024px)
     * - xl: max-w-screen-xl (1280px)
     * - 2xl: max-w-screen-2xl (1536px)
     * - full: max-w-full
     * - none: no max width
    */
    maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "none";
}

const Container: FC<ContainerProps> = ({
    className,
    children,
    maxWidth = "full",
    withPadding = true,
}) => {
    const maxWidthClasses = {
        xs: "max-w-screen-xs",
        sm: "max-w-screen-sm",
        md: "max-w-screen-md",
        lg: "max-w-screen-lg",
        xl: "max-w-screen-xl",
        "2xl": "max-w-screen-2xl",
        full: "max-w-full",
        none: "",
    };

    return (
        <div
            className={cn(
                "w-full mx-auto",
                maxWidthClasses[maxWidth],
                withPadding && "px-4 sm:px-6 md:px-8",
                className
            )}
        >
            {children}
        </div>
    );
};

export default Container; 