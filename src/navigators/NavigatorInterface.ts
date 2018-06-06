import { SignalDispatcher } from 'strongly-typed-events';

import { NavigationOptions } from '../NavigationOptions';

export interface NavigatorContructor {
    new(view: Titanium.UI.View): NavigatorInterface;
}

export interface NavigatorInterface {
    nativeNavigationSignalDispatcher: SignalDispatcher;
    initialize(): void;
    openRootWindow(): void;
    closeRootWindow(): void;
    shouldYieldNavigating(view: Titanium.Proxy): boolean;
    canOpen(view: Titanium.Proxy): boolean;
    open(view: Titanium.Proxy, options: NavigationOptions): void;
    canGoBack(): boolean;
    back(): void;
}
