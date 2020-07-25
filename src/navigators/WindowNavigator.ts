import { NavigationOptions } from '../NavigationOptions';
import { NavigationTransitionHandler, TransitionType } from '../transition';
import { AbstractNavigator } from './AbstractNavigator';

/**
 * Navigator implementation for Ti.UI.Window.
 *
 * This navigator can open other windows, tab groups and navigation windows.
 * Opened views will be stored in a stack to support back navigation.
 */
export class WindowNavigator extends AbstractNavigator {

    public static supportedRootView = 'Ti.UI.Window';

    public static supportedViews: Set<string> = new Set(['Ti.UI.Window', 'Ti.UI.TabGroup', 'Ti.UI.NavigationWindow']);

    protected yieldNavigationViews: Set<string> = new Set(['Ti.UI.TabGroup', 'Ti.UI.NavigationWindow']);

    /**
     * The Ti.UI.Window that acts as the root window.
     */
    private rootWindow: Titanium.UI.Window;

    /**
     * Stack of views that were opened by this navigator.
     */
    private windows: Titanium.Proxy[] = [];

    /**
     * Handles transition animations during opening and closing windows.
     */
    private transitionHandler: NavigationTransitionHandler;

    /**
     * Constructs a new window navigator.
     *
     * @param window Titanium.UI.Window that will be used as the root window.
     */
    constructor(window: Titanium.Proxy) {
        super(window);

        this.rootWindow = window as Titanium.UI.Window;
        this.transitionHandler = new NavigationTransitionHandler();
    }

    public openRootWindow(): void {
        this.windows.push(this.rootWindow);
        this.rootWindow.open();
    }

    public closeRootWindow(): void {
        this.rootWindow.close();
    }

    public closeNavigator(): void {
        this.windows.forEach(w => (w as Ti.UI.Window).close());
        this.closeRootWindow();
    }

    public open(view: Titanium.Proxy, options: NavigationOptions): void {
        const openWindowOptions: openWindowParams = {};

        Ti.API.debug(`options: ${JSON.stringify(options)}`);
        Ti.API.debug(`openWindowOptions: ${JSON.stringify(openWindowOptions)}`);

        if (options.transition && options.transition.type !== TransitionType.None) {
            const currentView = this.windows[this.windows.length - 1];
            this.transitionHandler.prepareTransition(view, currentView, options.transition, openWindowOptions);
            Ti.API.debug(`openWindowOptions: ${JSON.stringify(openWindowOptions)}`);
        }

        if (this.isWindow(view) || this.isNavigationWindow(view)) {
            view.open(openWindowOptions);
        } else if (this.isTabGroup(view)) {
            view.open();
        }

        if (options.clearHistory) {
            const prevWindows = this.windows.splice(0, this.windows.length);
            const closePreviousWindows = (): void => {
                prevWindows.forEach(w => (w as Ti.UI.Window).close());
                view.removeEventListener('open', closePreviousWindows);
            }
            view.addEventListener('open', closePreviousWindows);
        }

        if (!this.shouldYieldNavigating(view)) {
            this.windows.push(view);
        }
    }

    public canGoBack(): boolean {
        return this.windows.length > 1;
    }

    public back(): void {
        const window = this.windows.pop() as Titanium.UI.Window;
        window.close();
    }

    /**
     * Custom type guard to check if a view is a Ti.UI.Window.
     *
     * @param view View to check
     */
    private isWindow(view: Titanium.Proxy): view is Titanium.UI.Window {
        return view.apiName === 'Ti.UI.Window';
    }

    /**
     * Custom type guard to check if a view is a Ti.UI.TabGroup.
     *
     * @param view View to check
     */
    private isTabGroup(view: Titanium.Proxy): view is Titanium.UI.TabGroup {
        return view.apiName === 'Ti.UI.TabGroup';
    }

    /**
     * Custom type guard to check if a view is a Ti.UI.NavigationWindow.
     *
     * @param view View to check
     */
    private isNavigationWindow(view: Titanium.Proxy): view is Titanium.UI.NavigationWindow {
        return view.apiName === 'Ti.UI.NavigationWindow';
    }
}
