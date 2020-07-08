import { SignalDispatcher } from 'strongly-typed-events';

import { NavigationOptions } from '../NavigationOptions';
import { NavigatorInterface } from './NavigatorInterface';

/**
 * Abstract navigator serving as a base class for the individual navigator
 * implementations.
 *
 * A navigator operates on a root view (defined by the supportedRootView
 * property) and can open a set of other views (defined by supportedViews)
 * on top of that root view. It has to keep track of those views so they can be
 * closed later when a back navigation is requested.
 *
 * If a navigator opens a view that requires another navigator to take over
 * (defined by yieldNavigationViews), the {@link NavigationManager} will
 * stop using the currently active navigator and search for a new one to
 * continue.
 */
export abstract class AbstractNavigator implements NavigatorInterface {

    /**
     * The root view this navigator operates on.
     */
    public static supportedRootView: string | null = null;

    /**
     * Set of views that can be opned from this navigator.
     */
    public static supportedViews: Set<string> = new Set();

    /**
     * Event emitter for native navigation state changes.
     */
    public nativeNavigationSignal = new SignalDispatcher();

    /**
     * Set of views after which this navigator needs to yield to another
     * navigator.
     */
    protected yieldNavigationViews: Set<string> = new Set();

    constructor(view: Titanium.Proxy) {
        const staticSelf = (this.constructor as typeof AbstractNavigator);
        if (view.apiName !== staticSelf.supportedRootView) {
            throw new Error(`The ${this.toString()} can only handle navigation for ${staticSelf.supportedRootView}.`);
        }
    }

    /**
     * Returns wether this navigator can handle navigation within the
     * specified view.
     *
     * @param view Root view on which this navigator should start navigation
     */
    public static canHandle(view: Titanium.Proxy): boolean {
        return this.supportedRootView === view.apiName;
    }

    /**
     * Activates this navigator.
     */
    public activate(): void {
        // Does nothing by default, override in actual navigator implementation.
    }

    /**
     * Deactivates this navigator.
     */
    public deactivate(): void {
        // Does nothing by default, override in actual navigator implementation.
    }

    /**
     * Opens the root view of this navigator.
     */
    public abstract openRootWindow(): void;

    /**
     * Closes the root view of this navigator.
     */
    public abstract closeRootWindow(): void;

    /**
     * Returns wether this navigator should yield his navigating responsibilities
     * to another navigator after opening the specified view.
     *
     * @param view Last view that was opened
     */
    public shouldYieldNavigating(view: Titanium.Proxy): boolean {
        return this.yieldNavigationViews.has(view.apiName);
    }

    /**
     * Returns wether this navigator is able to open the given view.
     *
     * @param view Titanium view that should be opnened
     */
    public canOpen(view: Titanium.Proxy): boolean {
        return (this.constructor as any).supportedViews.has(view.apiName);
    }

    /**
     * Opens the given view using the navigation options.
     *
     * @param view View that should be opnened
     * @param options Navigation options to apply while opening the view
     */
    public abstract open(view: Titanium.Proxy, options: NavigationOptions): void;

    /**
     * Checks if this navigator has any more views in its stack where it can
     * perform a back nagivation.
     */
    public abstract canGoBack(): boolean;

    /**
     * Navigates one view back in the currently active stack.
     */
    public abstract back(): void;

    /**
     * Returns the class name of this navigator.
     */
    public toString(): string {
        return this.constructor.name;
    }
}
