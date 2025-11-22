import React, { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/admin/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/admin/card";
import { Alert, AlertDescription } from "@/components/ui/admin/alert";
import { handleErrorBoundaryError } from "@/utils/globalErrorHandler";

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({
            error,
            errorInfo,
        });

        handleErrorBoundaryError(error, errorInfo);

        this.props.onError?.(error, errorInfo);
    }

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                                <AlertTriangle className="h-6 w-6 text-destructive" />
                            </div>
                            <CardTitle className="text-xl">Oops! Something went wrong</CardTitle>
                            <CardDescription>
                                An unexpected error occurred. Please try again or contact support if the problem persists.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <Alert variant="destructive">
                                    <AlertDescription className="text-xs font-mono">
                                        {this.state.error.message}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="flex gap-2">
                                <Button
                                    onClick={this.handleRetry}
                                    className="flex-1"
                                    variant="outline"
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Try Again
                                </Button>
                                <Button
                                    onClick={this.handleGoHome}
                                    className="flex-1"
                                >
                                    <Home className="mr-2 h-4 w-4" />
                                    Go Home
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 