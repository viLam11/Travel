import React from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/admin/breadcrumb";

import { Link } from "react-router-dom";
import { type BreadcrumbItem as BreadcrumbItemType } from "@/hooks/useBreadcrumbs";

interface BreadcrumbsProps {
    items?: BreadcrumbItemType[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {

    return (
        <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
                {items?.map((item, index) => (
                    <React.Fragment key={`breadcrumb-${index}`}>
                        {index > 0 && <BreadcrumbSeparator />}
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link to={item.href} className="flex items-center gap-2">
                                    {item.icon}
                                    {item.label}
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}

export default Breadcrumbs; 