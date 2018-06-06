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
var AbstractNavigator_1 = require("./AbstractNavigator");
/**
 * Navigator implementation for Ti.UI.iOS.NavigationWindow
 *
 * This navigator can only open Ti.UI.Window views. Opened views will be stored
 * in a stack and closed by the navigation window's closeWindow() method.
 */
var NavigationWindowNavigator = /** @class */ (function (_super) {
    __extends(NavigationWindowNavigator, _super);
    /**
     * Constructs a new NavigationWindow navigator
     *
     * @param titaniumView Titanium.UI.iOS.NavigationWindow that will be used as the root window.
     */
    function NavigationWindowNavigator(titaniumView) {
        var _this = _super.call(this) || this;
        /**
         * Root window of this navigator which is a iOS NavigationWindow
         */
        _this.rootWindow = null;
        /**
         * Stack of windows that are openend in the NavigationWindow
         */
        _this.windows = [];
        if (titaniumView.apiName !== 'Ti.UI.iOS.NavigationWindow') {
            throw new Error('The NavigationWindowNavigator can only handle navigation for Ti.UI.iOS.NavigationWindow.');
        }
        _this.rootWindow = titaniumView;
        return _this;
    }
    NavigationWindowNavigator.prototype.initialize = function () {
        this.location = this._injector.get(common_1.PlatformLocation);
    };
    NavigationWindowNavigator.prototype.openRootWindow = function () {
        this.rootWindow.open();
    };
    NavigationWindowNavigator.prototype.closeRootWindow = function () {
        this.rootWindow.close();
    };
    NavigationWindowNavigator.prototype.open = function (view, options) {
        view.addEventListener('close', this.onWindowClose.bind(this));
        this.windows.push(view);
        this.rootWindow.openWindow(view, { animated: true });
    };
    NavigationWindowNavigator.prototype.canGoBack = function () {
        return this.windows.length >= 1;
    };
    NavigationWindowNavigator.prototype.back = function () {
        var window = this.windows.pop();
        window.removeEventListener('close', this.onWindowClose);
        this.rootWindow.closeWindow(window, null);
    };
    /**
     * Event handler for the "close" event of windows that were opened in the
     * root navigation window.
     *
     * Used to update Angular routing when a native back navigation was
     * triggered.
     *
     * @param event
     */
    NavigationWindowNavigator.prototype.onWindowClose = function (event) {
        var window = event.source;
        window.removeEventListener('close', this.onWindowClose);
        this.nativeNavigationState.emit();
        this.location.back();
    };
    NavigationWindowNavigator.supportedRootView = 'Ti.UI.iOS.NavigationWindow';
    NavigationWindowNavigator.supportedViews = new Set(['Ti.UI.Window']);
    return NavigationWindowNavigator;
}(AbstractNavigator_1.AbstractNavigator));
exports.NavigationWindowNavigator = NavigationWindowNavigator;
