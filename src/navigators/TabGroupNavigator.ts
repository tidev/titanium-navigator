import { NavigationOptions } from '../NavigationOptions';
import { deviceRuns } from '../utility';
import { AbstractNavigator } from './AbstractNavigator';

/**
 * A navigator for handling navigation inside the Tabs of a TabGroup.
 * 
 * This navigator can only open Ti.UI.Window views. Opened views will be stored
 * in a stack. Each tab has its own window stack, to allow individual back 
 * navigation.
 * 
 * The router state will also be recorded per tab, so switching between tabs
 * always restores the appropiarte routing history.
 */
export class TabGroupNavigator extends AbstractNavigator {

    public static supportedRootView: string = 'Ti.UI.TabGroup';

    public static supportedViews: Set<string> = new Set(['Ti.UI.Window']);

    /**
     * The root tab group view
     */
    private tabGroup: Titanium.UI.TabGroup;

    /**
     * Map of tabs and their window stack.
     */
    private windowStacks: Map<Titanium.UI.Tab, Titanium.UI.Window[]> = new Map();

    constructor(tabGroup: Titanium.Proxy) {
        super(tabGroup);

        this.tabGroup = tabGroup as Titanium.UI.TabGroup;
    }

    public initialize(): void {
        this.tabGroup.addEventListener('focus', event => {
            if (event.previousIndex === -1 || !this.tabGroup.activeTab) {
                return;
            }

            // TODO: Replace with platform independent implemention
            // this.routerStateManager.applySnapshot(this.tabGroup.activeTab);
        });
    }

    public openRootWindow(): void {
        this.tabGroup.open();
    }

    public closeRootWindow(): void {
        this.tabGroup.close();
    }

    public open(view: Titanium.Proxy, options: NavigationOptions): void {
        view.addEventListener('close', this.onWindowClose.bind(this));
        const activeTab = this.tabGroup.activeTab;
        let windowStack = this.windowStacks.get(activeTab);
        if (!windowStack) {
            windowStack = [];
            this.windowStacks.set(activeTab, windowStack);
        }
        windowStack.push(view as any);
        this.tabGroup.activeTab.open(view as any);

        // TODO: Make platform independent
        // this.routerStateManager.updateRouterStateSnapshot(this.tabGroup.activeTab);
    }

    public canGoBack(): boolean {
        const activeTab = this.tabGroup.activeTab;
        const windowStack = this.windowStacks.get(activeTab);
        return windowStack ? windowStack.length >= 1 : false;
    }

    public back(): void {
        const activeTab = this.tabGroup.activeTab;
        const windowStack = this.windowStacks.get(activeTab);
        if (!windowStack || windowStack.length === 0) {
            throw new Error('The currently active tab doesn\'t have any more windows to close, cannot go back.');
        }

        const window = windowStack.pop() as Titanium.UI.Window;
        window.removeEventListener('close', this.onWindowClose);
        if (deviceRuns('ios')) {
            this.tabGroup.activeTab.close(window);
        } else {
            window.close();
        }

        // TODO: Make platform independent
        // this.routerStateManager.updateRouterStateSnapshot(this.tabGroup.activeTab);
    }

    /**
     * Event handler for the 'close' event of windows in a tab's window stack.
     * 
     * This is used to track native navigation events and then update the internal
     * router states accordingly.
     * 
     * @param event 
     */
    public onWindowClose(event: any): void {
        const window = event.source as Titanium.UI.Window;
        window.removeEventListener('close', this.onWindowClose);

        this.nativeNavigationSignalDispatcher.dispatch();

        // TODO: Make platform independent
        // this.location.back();
        // this.routerStateManager.updateRouterStateSnapshot(this.tabGroup.activeTab);
    }
}
