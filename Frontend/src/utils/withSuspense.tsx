import { Suspense, lazy, type LazyExoticComponent, type ComponentType } from 'react';
import { LoadingSpinner } from '@/components/common/feedback/LoadingSpinner';

const SuspenseFallback = () => (
  <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
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