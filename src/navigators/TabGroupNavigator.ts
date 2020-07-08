import { RouterStateAdapterInterface } from '../adapters';
import { NavigationOptions } from '../NavigationOptions';
import { deviceRuns } from '../utility';
import { AbstractNavigator } from './AbstractNavigator';
import { StateAdapterFactory } from './loader';

/**
 * Flag to show if the App was restarted by LiveView.
 *
 * On Android the topmost window's `close` event is fired after the App was
 * reloaded using LiveView AND the new window already fired its `open`
 * event. This screws up internal router state, so we set this flag to
 * avoid sending the native back navigation signal in this particular case.
 */
let liveViewRestart = false;
// Patch internal Ti.App._restart to track LiveView reloads
const _restart = (Ti.App as any)._restart;
if (!_restart.__navigatorPatch) {
    (Ti.App as any)._restart = (): void => {
        liveViewRestart = true;
        _restart();
    }
    _restart.__navigatorPatch = true
}


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

    public static supportedRootView = 'Ti.UI.TabGroup';

    public static supportedViews: Set<string> = new Set(['Ti.UI.Window']);

    /**
     * Event handler for the `close` event of windows in a tab's window stack.
     *
     * This is used to track native back navigation and will dispatch the
     * `nativeNavigationSignal` signal.
     */
    public onWindowClose: (event: any) => void;

    /**
     * The root tab group view
     */
    private tabGroup: Titanium.UI.TabGroup;

    /**
     * Map of tabs and their window stack.
     */
    private windowStacks: Map<Titanium.UI.Tab, Titanium.UI.Window[]> = new Map();

    /**
     * An adapter to the internal state of the consuming router
     */
    private routerStateAdapter: RouterStateAdapterInterface;

    constructor(tabGroup: Titanium.Proxy, createRouterStateAdapter: StateAdapterFactory) {
        super(tabGroup);

        this.tabGroup = tabGroup as Titanium.UI.TabGroup;
        this.routerStateAdapter = createRouterStateAdapter(this.tabGroup);
        this.onWindowClose = (event: any): void => {
            if (deviceRuns('android') && liveViewRestart) {
                liveViewRestart = false;
                return;
            }
            const window = event.source as Titanium.UI.Window;
            window.removeEventListener('close', this.onWindowClose);
            this.nativeNavigationSignal.dispatch();
        }
    }

    public activate(): void {
        this.routerStateAdapter.activate();
        this.tabGroup.addEventListener('focus', event => {
            if (event.previousIndex === -1 || !this.tabGroup.activeTab) {
                return;
            }

            this.routerStateAdapter.applySnapshot(this.tabGroup.activeTab as Titanium.UI.Tab);
        });
    }

    public deactivate(): void {
        this.routerStateAdapter.deactivate();
    }

    public openRootWindow(): void {
        this.tabGroup.open();
    }

    public closeRootWindow(): void {
        this.tabGroup.close();
    }

    public open(view: Titanium.Proxy, options: NavigationOptions): void {
        view.addEventListener('close', this.onWindowClose);
        const activeTab = this.tabGroup.activeTab as Titanium.UI.Tab;
        let windowStack = this.windowStacks.get(activeTab);
        if (!windowStack) {
            windowStack = [];
            this.windowStacks.set(activeTab, windowStack);
        }
        windowStack.push(view as any);
        activeTab.open(view as any);

        this.routerStateAdapter.updateRouterStateSnapshot(activeTab);
    }

    public canGoBack(): boolean {
        const activeTab = this.tabGroup.activeTab as Titanium.UI.Tab;
        const windowStack = this.windowStacks.get(activeTab);
        return windowStack ? windowStack.length >= 1 : false;
    }

    public back(): void {
        const activeTab = this.tabGroup.activeTab as Titanium.UI.Tab;
        const windowStack = this.windowStacks.get(activeTab);
        if (!windowStack || windowStack.length === 0) {
            throw new Error('The currently active tab doesn\'t have any more windows to close, cannot go back.');
        }

        const window = windowStack.pop() as Titanium.UI.Window;
        window.removeEventListener('close', this.onWindowClose);
        if (deviceRuns('ios')) {
            activeTab.close(window);
        } else {
            window.close();
        }

        this.routerStateAdapter.updateRouterStateSnapshot(activeTab);
    }
}
