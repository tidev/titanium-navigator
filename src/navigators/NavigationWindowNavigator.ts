import { NavigationOptions } from '../NavigationOptions';
import { deviceRuns, TiAppInternal } from '../utility';
import { AbstractNavigator } from './AbstractNavigator';

/**
 * Navigator implementation for Ti.UI.NavigationWindow
 *
 * This navigator can only open Ti.UI.Window views. Opened views will be stored
 * in a stack and closed by the navigation window's closeWindow() method.
 */
export class NavigationWindowNavigator extends AbstractNavigator {

    public static supportedRootView = 'Ti.UI.NavigationWindow';

    public static supportedViews: Set<string> = new Set(['Ti.UI.Window']);

    /**
     * Event handler for the `close` event of windows in the window stack.
     *
     * This is used to track native back navigation and will dispatch the
     * `nativeNavigationSignal` signal.
     */
    public onWindowClose: (event: any) => void;

    /**
     * Root window of this navigator which is a NavigationWindow
     */
    private rootWindow: Titanium.UI.NavigationWindow;

    /**
     * Stack of windows that are openend in the NavigationWindow
     */
    private windows: Titanium.Proxy[] = [];

    /**
     * Constructs a new NavigationWindow navigator
     *
     * @param navigationWindow Titanium.UI.NavigationWindow that will be used as the root window.
     */
    constructor(navigationWindow: Titanium.Proxy) {
        super(navigationWindow);

        this.rootWindow = navigationWindow as Titanium.UI.NavigationWindow;
        this.onWindowClose = (event: any): void => {
            const App = Ti.App as any as TiAppInternal;
            if (deviceRuns('android') && App._restart.__liveViewRestart) {
                App._restart.__liveViewRestart = false;
                return;
            }
            const window = event.source as Titanium.UI.Window;
            window.removeEventListener('close', this.onWindowClose);
            this.nativeNavigationSignal.dispatch();
        }
    }

    public activate(): void {
        this.rootWindow.window.addEventListener('close', this.onWindowClose);
    }

    public deactivate(): void {
        this.rootWindow.window.removeEventListener('close', this.onWindowClose);
    }

    public openRootWindow(): void {
        this.rootWindow.open();
    }

    public closeRootWindow(): void {
        this.rootWindow.close();
    }

    public closeNavigator(): void {
        this.windows.forEach(w => w.removeEventListener('close', this.onWindowClose));
        this.windows = [];
        this.rootWindow.close();
    }

    public open(view: Titanium.Proxy, options: NavigationOptions): void {
        view.addEventListener('close', this.onWindowClose);
        this.windows.push(view);
        this.rootWindow.openWindow(view as Titanium.UI.Window, { animated: true });
    }

    public canGoBack(): boolean {
        return this.windows.length >= 1;
    }

    public back(): void {
        const window = this.windows.pop() as Titanium.UI.Window;
        window.removeEventListener('close', this.onWindowClose);
        this.rootWindow.closeWindow(window, null);
    }
}
