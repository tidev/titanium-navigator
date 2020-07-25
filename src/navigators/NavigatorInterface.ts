import { SignalDispatcher } from 'strongly-typed-events';

import { NavigationOptions } from '../NavigationOptions';

export interface NavigatorContructor {
    supportedRootView: string | null;
    supportedViews: Set<string>;
    new(view: Titanium.Proxy, ...args: any[]): NavigatorInterface;
    canHandle(view: Titanium.Proxy): boolean;
}

export interface NavigatorProvider {
    class: NavigatorContructor;
    deps: any[];
}

export interface NavigatorInterface {
    nativeNavigationSignal: SignalDispatcher;
    activate(): void;
    deactivate(): void;
    openRootWindow(): void;
    closeRootWindow(): void;
    closeNavigator(): void;
    shouldYieldNavigating(view: Titanium.Proxy): boolean;
    canOpen(view: Titanium.Proxy): boolean;
    open(view: Titanium.Proxy, options: NavigationOptions): void;
    canGoBack(): boolean;
    back(): void;
}

export function createNavigator(ctor: NavigatorContructor, view: Titanium.Proxy, ...args: any[]): NavigatorInterface {
    return new ctor(view, ...args);
}
