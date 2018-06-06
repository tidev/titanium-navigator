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
var AbstractNavigator_1 = require("./AbstractNavigator");
var animation_1 = require("../../animation");
/**
 * Navigator implementation for Ti.UI.Window.
 *
 * This navigator can open other windows, tab groups and iOS navigation windows.
 * Opened views will be stored in a stack to support back navigation.
 */
var WindowNavigator = /** @class */ (function (_super) {
    __extends(WindowNavigator, _super);
    /**
     * Constructs a new window navigator.
     *
     * @param titaniumView Titanium.UI.Window that will be used as the root window.
     */
    function WindowNavigator(titaniumView) {
        var _this = _super.call(this) || this;
        _this.yieldNavigationViews = new Set(['Ti.UI.TabGroup', 'Ti.UI.iOS.NavigationWindow']);
        /**
         * The Ti.UI.Window that acts as the root window.
         */
        _this.rootWindow = null;
        /**
         * Stack of views that were opened by this navigator.
         */
        _this.windows = [];
        if (titaniumView.apiName !== 'Ti.UI.Window') {
            throw new Error('The WindowNavigator can only handle navigation for Ti.UI.Window.');
        }
        _this.rootWindow = titaniumView;
        return _this;
    }
    WindowNavigator.prototype.initialize = function () {
        this.transitionHandler = this._injector.get(animation_1.NavigationTransitionHandler);
    };
    WindowNavigator.prototype.openRootWindow = function () {
        this.windows.push(this.rootWindow);
        this.rootWindow.open();
    };
    WindowNavigator.prototype.closeRootWindow = function () {
        this.rootWindow.close();
    };
    WindowNavigator.prototype.open = function (view, options) {
        var openWindowOptions = {};
        if (options.clearHistory) {
        }
        console.log("options: " + JSON.stringify(options));
        console.log("openWindowOptions: " + JSON.stringify(openWindowOptions));
        if (options.transition.type !== animation_1.TransitionType.None) {
            var currentView = this.windows[this.windows.length - 1];
            this.transitionHandler.prepareTransition(view, currentView, options.transition, openWindowOptions);
            console.log("openWindowOptions: " + JSON.stringify(openWindowOptions));
        }
        this.windows.push(view);
        if (this.isWindow(view) || this.isNavigationWindow(view)) {
            view.open(openWindowOptions);
        }
        else if (this.isTabGroup(view)) {
            view.open();
        }
    };
    WindowNavigator.prototype.canGoBack = function () {
        return this.windows.length > 1;
    };
    WindowNavigator.prototype.back = function () {
        var window = this.windows.pop();
        window.close();
    };
    /**
     * Custom type guard to check if a view is a Ti.UI.Window.
     *
     * @param view View to check
     */
    WindowNavigator.prototype.isWindow = function (view) {
        return view.apiName === 'Ti.UI.Window';
    };
    /**
     * Custom type guard to check if a view is a Ti.UI.TabGroup.
     *
     * @param view View to check
     */
    WindowNavigator.prototype.isTabGroup = function (view) {
        return view.apiName === 'Ti.UI.TabGroup';
    };
    /**
     * Custom type guard to check if a view is a Ti.UI.iOS.NavigationWindow.
     *
     * @param view View to check
     */
    WindowNavigator.prototype.isNavigationWindow = function (view) {
        return view.apiName === 'Ti.UI.iOS.NavigationWindow';
    };
    WindowNavigator.supportedRootView = 'Ti.UI.Window';
    WindowNavigator.supportedViews = new Set(['Ti.UI.Window', 'Ti.UI.TabGroup', 'Ti.UI.iOS.NavigationWindow']);
    return WindowNavigator;
}(AbstractNavigator_1.AbstractNavigator));
exports.WindowNavigator = WindowNavigator;
