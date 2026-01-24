import type { FC } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

const NotFoundPage: FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold">404</h1>
        <p className="text-2xl">Page not found</p>
        <p className="text-sm text-muted-foreground">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          to={ROUTES.ROOT}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;