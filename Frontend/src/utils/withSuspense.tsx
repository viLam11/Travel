import { Suspense, lazy, type LazyExoticComponent, type ComponentType } from 'react';
import { LoadingSpinner } from '@/components/common/feedback/LoadingSpinner';

const SuspenseFallback = () => (
    <LoadingSpinner size="lg" />
);

export const withSuspense = (Component: LazyExoticComponent<ComponentType<unknown>>) => (
    <Suspense fallback={<SuspenseFallback />}>
        <Component />
    </Suspense>
);

export function lazyWithPreload<T extends ComponentType<unknown>>(
    factory: () => Promise<{ default: T }>
) {
    const LazyComponent = lazy(factory);
    const Component = LazyComponent as LazyExoticComponent<T> & { preload: () => void };
    Component.preload = factory;
    return Component;
}