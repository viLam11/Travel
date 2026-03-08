import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/admin/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/admin/tooltip";
import { Button } from "@/components/ui/admin/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
    const { setTheme } = useTheme();

    return (
        <DropdownMenu>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className={cn("h-8 w-8", className)}>
                            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="">Change theme</p>
                </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" sideOffset={5} collisionPadding={10}>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Laptop className="mr-2 h-4 w-4" />
                    <span>System</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default ThemeToggle; 