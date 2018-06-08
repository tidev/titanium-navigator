import { NavigationOptions } from '../NavigationOptions';
import { AbstractNavigator } from './AbstractNavigator';

/**
 * Navigator implementation for Ti.UI.iOS.NavigationWindow
 * 
 * This navigator can only open Ti.UI.Window views. Opened views will be stored
 * in a stack and closed by the navigation window's closeWindow() method.
 */
export class NavigationWindowNavigator extends AbstractNavigator {

    public static supportedRootView: string = 'Ti.UI.iOS.NavigationWindow';

    public static supportedViews: Set<string> = new Set(['Ti.UI.Window']);

    /**
     * Root window of this navigator which is a iOS NavigationWindow
     */
    private rootWindow: Titanium.UI.iOS.NavigationWindow;

    /**
     * Stack of windows that are openend in the NavigationWindow
     */
    private windows: Titanium.Proxy[] = [];

    /**
     * Constructs a new NavigationWindow navigator
     * 
     * @param navigationWindow Titanium.UI.iOS.NavigationWindow that will be used as the root window.
     */
    constructor(navigationWindow: Titanium.Proxy) {
        super(navigationWindow);

        this.rootWindow = navigationWindow as Titanium.UI.iOS.NavigationWindow;
    }

    public openRootWindow(): void {
        this.rootWindow.open();
    }

    public closeRootWindow(): void {
        this.rootWindow.close();
    }

    public open(view: Titanium.Proxy, options: NavigationOptions) {
        view.addEventListener('close', this.onWindowClose.bind(this));
        this.windows.push(view);
        this.rootWindow.openWindow(view as Titanium.UI.Window, { animated: true });
    }

    public canGoBack() {
        return this.windows.length >= 1;
    }

    public back() {
        const window = this.windows.pop() as Titanium.UI.Window;
        window.removeEventListener('close', this.onWindowClose);
        this.rootWindow.closeWindow(window, null);
    }

    /**
     * Event handler for the "close" event of windows that were opened in the
     * root navigation window.
     * 
     * Used to update Angular routing when a native back navigation was
     * triggered.
     * 
     * @param event 
     */
    public onWindowClose(event: any): void {
        const window = event.source as Titanium.UI.Window;
        window.removeEventListener('close', this.onWindowClose);

        this.nativeNavigationSignalDispatcher.dispatch();

        // TODO: Update framework's routing state
    }
}
