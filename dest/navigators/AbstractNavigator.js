"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
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
var AbstractNavigator = /** @class */ (function () {
    function AbstractNavigator() {
        /**
         * Event emitter for native navigation state changes.
         */
        this.nativeNavigationState = new core_1.EventEmitter();
        /**
         * Set of views after which this navigator needs to yield to another
         * navigator.
         */
        this.yieldNavigationViews = new Set();
    }
    Object.defineProperty(AbstractNavigator.prototype, "injector", {
        /**
         * Sets the Angular root injector.
         */
        set: function (injector) {
            this._injector = injector;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns wether this navigator can handle navigation using the
     * specified view as its root view.
     *
     * @param view Root view on which this navigator should start navigation
     */
    AbstractNavigator.canHandle = function (view) {
        return this.supportedRootView === view.apiName;
    };
    /**
     * Returns wether this navigator should yield his navigating responsibilities
     * of to another navigator.
     *
     * @param view Last view that was opened
     */
    AbstractNavigator.prototype.shouldYieldNavigating = function (view) {
        return this.yieldNavigationViews.has(view.apiName);
    };
    /**
     * Return wether this navigator is able to open the given view.
     *
     * @param view Titanium view that should be opnened
     */
    AbstractNavigator.prototype.canOpen = function (view) {
        return this.constructor.supportedViews.has(view.apiName);
    };
    /**
     * Returns the class name of this navigator.
     */
    AbstractNavigator.prototype.toString = function () {
        return this.constructor.name;
    };
    /**
     * The root view this navigator operates on.
     */
    AbstractNavigator.supportedRootView = null;
    /**
     * Set of views that can be opned from this navigator.
     */
    AbstractNavigator.supportedViews = new Set();
    return AbstractNavigator;
}());
exports.AbstractNavigator = AbstractNavigator;
