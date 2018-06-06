"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = require("@angular/common");
var common_2 = require("../../common");
var services_1 = require("../../services");
var NavigationAwareRouteReuseStrategy_1 = require("../NavigationAwareRouteReuseStrategy");
var AbstractNavigator_1 = require("./AbstractNavigator");
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
var TabGroupNavigator = /** @class */ (function (_super) {
    __extends(TabGroupNavigator, _super);
    function TabGroupNavigator(tabGroup) {
        var _this = _super.call(this) || this;
        /**
         * Map of tabs and their window stack.
         */
        _this.windowStacks = new Map();
        if (tabGroup.apiName !== 'Ti.UI.TabGroup') {
            throw new Error('The TabGroupNavigator can only handle navigation for Ti.UI.TabGroup');
        }
        _this.tabGroup = tabGroup;
        return _this;
    }
    TabGroupNavigator.prototype.initialize = function () {
        var _this = this;
        this.device = this._injector.get(services_1.DeviceEnvironment);
        this.location = this._injector.get(common_1.PlatformLocation);
        this.routerStateManager = new RouterStateManager(this._injector);
        this.tabGroup.addEventListener('focus', function (event) {
            if (event.previousIndex === -1 || !_this.tabGroup.activeTab) {
                return;
            }
            _this.routerStateManager.applySnapshot(_this.tabGroup.activeTab);
        });
    };
    TabGroupNavigator.prototype.openRootWindow = function () {
        this.tabGroup.open();
    };
    TabGroupNavigator.prototype.closeRootWindow = function () {
        this.tabGroup.close();
    };
    TabGroupNavigator.prototype.open = function (view, options) {
        view.addEventListener('close', this.onWindowClose.bind(this));
        var activeTab = this.tabGroup.activeTab;
        var windowStack = this.windowStacks.get(activeTab);
        if (!windowStack) {
            windowStack = [];
            this.windowStacks.set(activeTab, windowStack);
        }
        windowStack.push(view);
        this.tabGroup.activeTab.open(view);
        this.routerStateManager.updateRouterStateSnapshot(this.tabGroup.activeTab);
    };
    TabGroupNavigator.prototype.canGoBack = function () {
        var activeTab = this.tabGroup.activeTab;
        var windowStack = this.windowStacks.get(activeTab);
        return windowStack && windowStack.length >= 1;
    };
    TabGroupNavigator.prototype.back = function () {
        var activeTab = this.tabGroup.activeTab;
        var windowStack = this.windowStacks.get(activeTab);
        if (!windowStack || windowStack.length === 0) {
            throw new Error('The currently active tab doesn\'t have any more windows to close, cannot go back.');
        }
        var window = windowStack.pop();
        window.removeEventListener('close', this.onWindowClose);
        if (this.device.runs('ios')) {
            this.tabGroup.activeTab.close(window);
        }
        else {
            window.close();
        }
        this.routerStateManager.updateRouterStateSnapshot(this.tabGroup.activeTab);
    };
    /**
     * Event handler for the 'close' event of windows in a tab's window stack.
     *
     * This is used to track native navigation events and then update the internal
     * router states accordingly.
     *
     * @param event
     */
    TabGroupNavigator.prototype.onWindowClose = function (event) {
        var window = event.source;
        window.removeEventListener('close', this.onWindowClose);
        this.nativeNavigationState.emit();
        this.location.back();
        this.routerStateManager.updateRouterStateSnapshot(this.tabGroup.activeTab);
    };
    TabGroupNavigator.supportedRootView = 'Ti.UI.TabGroup';
    TabGroupNavigator.supportedViews = new Set(['Ti.UI.Window']);
    return TabGroupNavigator;
}(AbstractNavigator_1.AbstractNavigator));
exports.TabGroupNavigator = TabGroupNavigator;
/**
 * A snapshot of internal router states.
 */
var RouterStateSnapshot = /** @class */ (function () {
    /**
     * Constructs a new router state snapshot.
     *
     * @param historyStack The location states stack
     * @param detachedRouteHandles Map of detached route handlers
     */
    function RouterStateSnapshot(historyStack, detachedRouteHandles) {
        this.historyStack = historyStack;
        this.detachedRouteHandles = detachedRouteHandles;
    }
    /**
     * Compares this router state snapshot against another one.
     *
     * @param other Other router state snapshot to compare against
     * @return True if both snapshots are equal, false if not.
     */
    RouterStateSnapshot.prototype.isEqual = function (other) {
        if (this.historyStack.length !== other.historyStack.length) {
            return false;
        }
        for (var i = 0; i < this.historyStack.length; i++) {
            var state = this.historyStack[i];
            var otherState = other.historyStack[i];
            if (state.url !== otherState.url) {
                return false;
            }
        }
        return true;
    };
    /**
     * Returns a string representation of this router state snapshot.
     */
    RouterStateSnapshot.prototype.toString = function () {
        return this.historyStack.map(function (state) { return state.url; }).join('/');
    };
    return RouterStateSnapshot;
}());
/**
 * A manager for the internal router states.
 *
 * Saves and updates router state snapshots for each tab. Used to keep
 * track of the different router states in each tab.
 */
var RouterStateManager = /** @class */ (function () {
    /**
     * Constructs a new router state manager.
     *
     * @param injector Injector of the router module
     */
    function RouterStateManager(injector) {
        /**
         * Map of tabs and their current router state snapshot.
         */
        this.routerSnapshots = new Map();
        this.historyStack = injector.get(common_2.HistoryStack);
        this.routeReuseStrategy = injector.get(NavigationAwareRouteReuseStrategy_1.NavigationAwareRouteReuseStrategy);
        this.initalSnapshot = this.createSnapshot();
    }
    /**
     * Updates the current router state snpashot for the given tab.
     *
     * @param tab Tab to associate the current router state snapshot with.
     */
    RouterStateManager.prototype.updateRouterStateSnapshot = function (tab) {
        var snapshot = this.createSnapshot();
        this.routerSnapshots.set(tab, snapshot);
        console.log("Updated router snapshot for tab " + tab.title + " to: " + snapshot);
    };
    /**
     * Applies the router states from the stored snapshot of the given tab.
     *
     * @param tab Tab for which to look up and apply previously stored router states.
     */
    RouterStateManager.prototype.applySnapshot = function (tab) {
        if (!tab || tab.apiName !== 'Ti.UI.Tab') {
            throw new Error('Invalid tab received while trying to apply router snapshot after switching tab.');
        }
        var storedSnapshot = this.routerSnapshots.get(tab);
        if (!storedSnapshot) {
            storedSnapshot = this.initalSnapshot;
            this.routerSnapshots.set(tab, storedSnapshot);
        }
        var currentSnapshot = this.createSnapshot();
        if (storedSnapshot.isEqual(currentSnapshot)) {
            console.log("Router snapshot for tab " + tab.title + " is equal to current snapshot, skipping restore.");
            return;
        }
        console.log("Restoring router snapshot for tab " + tab.title + " to: " + storedSnapshot);
        this.historyStack.restoreStack(storedSnapshot.historyStack);
        this.routeReuseStrategy.restoreHandlers(storedSnapshot.detachedRouteHandles);
    };
    /**
     * Creates a new router state snapshot from the current location history and detached
     * route handlers.
     *
     * @return The created snpashot of the current router states.
     */
    RouterStateManager.prototype.createSnapshot = function () {
        var historySnapshot = this.historyStack.snapshotStack();
        var handlersSnapshot = this.routeReuseStrategy.snapshotDetachedRoutehandlers();
        return new RouterStateSnapshot(historySnapshot, handlersSnapshot);
    };
    return RouterStateManager;
}());
