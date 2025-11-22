import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { Home, ListTodo, FileText } from "lucide-react";

export interface BreadcrumbItem {
    label: string;
    href: string;
    icon?: React.ReactNode;
}

export function useBreadcrumbs(): BreadcrumbItem[] {
    const location = useLocation();

    return useMemo(() => {
        const routeConfig: Record<string, { label: string; icon?: React.ReactNode }> = {
            [ROUTES.ROOT]: { label: "Dashboard", icon: <Home className="h-4 w-4" /> },
            // [ROUTES.PIPELINE_TRACKERS]: { label: "Pipeline Trackers", icon: <ListTodo className="h-4 w-4" /> },
            // [ROUTES.CONFIGURATIONS]: { label: "Configurations", icon: <FileText className="h-4 w-4" /> },
        };

        const breadcrumbPathMap: Record<string, string[]> = {
            // [ROUTES.PIPELINE_TRACKERS]: [ROUTES.PIPELINE_TRACKERS],
            // [ROUTES.CONFIGURATIONS]: [ROUTES.CONFIGURATIONS],
        };

        if (location.pathname === ROUTES.LOGIN || location.pathname === '/404') {
            return [];
        }

        if (location.pathname === ROUTES.ROOT) {
            return [{
                label: "Dashboard",
                href: ROUTES.ROOT,
                icon: <Home className="h-4 w-4" />,
            }];
        }

        const mappedPath = breadcrumbPathMap[location.pathname];
            if (mappedPath) {
            return mappedPath.map((path) => ({
                label: routeConfig[path]?.label ?? path,
                href: path,
                icon: routeConfig[path]?.icon,
            }));
        }

        const config = routeConfig[location.pathname];
        if (config) {
            return [{
                label: config.label,
                href: location.pathname,
                icon: config.icon,
            }];
        }

        const pathSegments = location.pathname.split('/').filter(Boolean);
        const lastSegment = pathSegments[pathSegments.length - 1];
        return [{
            label: lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' '),
            href: location.pathname,
        }];
    }, [location.pathname]);
}