"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var vdom_1 = require("../vdom");
var NavigationWindowNavigator_1 = require("./navigators/NavigationWindowNavigator");
var TabGroupNavigator_1 = require("./navigators/TabGroupNavigator");
var WindowNavigator_1 = require("./navigators/WindowNavigator");
/**
 * Manages navigation inside the app by using different navigators which
 * handle opening and closing views inside the view hierarchy.
 */
var NavigationManager = /** @class */ (function () {
    /**
     * Constructs the navigation manager.
     *
     * @param injector Router module injector
     * @param logger Default logger instance
     */
    function NavigationManager(injector, logger) {
        /**
         * List of available navigators.
         */
        this.availableNavigators = [
            NavigationWindowNavigator_1.NavigationWindowNavigator,
            TabGroupNavigator_1.TabGroupNavigator,
            WindowNavigator_1.WindowNavigator
        ];
        /**
         * Stack of navigators.
         */
        this.navigators = [];
        /**
         * Internal Flag indicating that a native back navigation is in progress.
         */
        this._nativeBackNavigation = false;
        /**
         * Internal flag indicating that a back navigation triggered by
         * {@link TitaniumPlatformLocation} is in progress.
         */
        this._locationBackNavigation = false;
        this.injector = injector;
        this.logger = logger;
    }
    Object.defineProperty(NavigationManager.prototype, "openableViews", {
        /**
         * A set of views that can automatically be openend using one of the available
         * navigators.
         *
         * Generated automatically on first access from the list of available
         * navigators using their supportedViews property.
         */
        get: function () {
            var _this = this;
            if (!this._openableViews) {
                console.log('init openableViews');
                this._openableViews = new Set();
                this.availableNavigators.forEach(function (navigator) {
                    console.log(navigator.name + ".supportedViews: " + Array.from(navigator.supportedViews).join(', '));
                    navigator.supportedViews.forEach(function (viewApiName) { return _this._openableViews.add(viewApiName); });
                });
                console.log(this._openableViews);
            }
            return this._openableViews;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NavigationManager.prototype, "isNativeBackNavigation", {
        /**
         * Returns true if a native back navigation is currently in progress.
         */
        get: function () {
            return this._nativeBackNavigation;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NavigationManager.prototype, "nativeBackNavigation", {
        /**
         * Sets the flag indicating a native back navigation.
         */
        set: function (nativeBackNavigation) {
            this._nativeBackNavigation = nativeBackNavigation;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NavigationManager.prototype, "isLocationBackNavigation", {
        /**
         * Returns true if a back navigation triggered by {@link TitaniumPlatformLocation}
         * is currently in progress.
         */
        get: function () {
            return this._locationBackNavigation;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NavigationManager.prototype, "locationBackNavigation", {
        /**
         * Sets the flag indicating a location triggered back navigation.
         */
        set: function (locationBackNavigation) {
            this._locationBackNavigation = locationBackNavigation;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Creates the root navigator and opens its root window.
     *
     * @param component
     */
    NavigationManager.prototype.createAndOpenRootNavigator = function (component) {
        var navigator = this.createNavigator(component);
        navigator.openRootWindow();
        this.pushNavigator(navigator);
    };
    /**
     * Opens
     *
     * @param component
     */
    NavigationManager.prototype.open = function (component) {
        var componentName = component.componentType.name;
        if (!this.activeNavigator) {
            throw new Error("No active navigator available to handle navigation to " + componentName);
        }
        var titaniumView = this.findTopLevelOpenableView(component);
        if (!this.activeNavigator.canOpen(titaniumView)) {
            throw new Error("Currently active navigator " + this.activeNavigator + " cannot open a " + titaniumView.apiName);
        }
        this.logger.debug("NavigationManager - " + this.activeNavigator + ".open(" + titaniumView.apiName + ") from component: " + componentName);
        this.activeNavigator.open(titaniumView, this.currentNavigationOptions);
        if (this.activeNavigator.shouldYieldNavigating(titaniumView)) {
            this.logger.trace("NavigationManager - " + this.activeNavigator + " cannot continue after " + titaniumView.apiName + " was opened, yielding to new navigator.");
            var navigator_1 = this.createNavigator(component);
            this.pushNavigator(navigator_1);
        }
        // @todo Handle modals -> create new appropriate navigator
    };
    NavigationManager.prototype.back = function () {
        this.logger.trace('NavigationManager.back()');
        if (!this.activeNavigator) {
            throw new Error('No active navigator available to handle back navigation request.');
        }
        if (this.activeNavigator.canGoBack()) {
            this.logger.trace("NavigationManager - " + this.activeNavigator + " has windows it can close, going back.");
            this.activeNavigator.back();
        }
        else {
            if (this.navigators.length === 1) {
                throw new Error('Tried to close the root navigator, which is not allowed.');
            }
            this.logger.trace("NavigationManager - " + this.activeNavigator + " has no more windows it can close, closing and popping navigator.");
            this.activeNavigator.closeRootWindow();
            this.popNavigator();
        }
    };
    NavigationManager.prototype.resetBackNavigationFlags = function () {
        this.nativeBackNavigation = false;
        this.locationBackNavigation = false;
    };
    /**
     * Creates a new navigator instance for the given component.
     *
     * Removes the component from the DOM tree and searches for the first
     * openable view element. Then it tries to find the appropriate
     * navigator for this view and creates it.
     *
     * @param component
     */
    NavigationManager.prototype.createNavigator = function (component) {
        var componentName = component.componentType.name;
        var componentElement = component.location.nativeElement;
        componentElement.parentElement.removeChild(componentElement);
        var titaniumView = this.findTopLevelOpenableView(component);
        var navigator = null;
        for (var _i = 0, _a = this.availableNavigators; _i < _a.length; _i++) {
            var candidateNavigatorClass = _a[_i];
            if (candidateNavigatorClass.canHandle(titaniumView)) {
                this.logger.debug("Creating navigator " + candidateNavigatorClass.name + " for component " + componentName + ".");
                navigator = new candidateNavigatorClass(titaniumView);
                navigator.injector = this.injector;
                navigator.initialize();
                break;
            }
        }
        if (navigator === null) {
            throw new Error("Could not resolve matching navigator for component " + componentName + " (top-level view: " + titaniumView.apiName + ").");
        }
        return navigator;
    };
    /**
     * Activates the passed navigator, subscribing to native navigation state events.
     *
     * @param navigator Navigator to activate
     */
    NavigationManager.prototype.activateNavigator = function (navigator) {
        var _this = this;
        this.activeNavigator = navigator;
        this.activeNativeNavigationStateSubscription = this.activeNavigator.nativeNavigationState.subscribe(function (nativeNavigationEvent) {
            if (_this.isNativeBackNavigation) {
                throw new Error('Native back navigation is already in progress');
            }
            _this._nativeBackNavigation = true;
        });
        this.logger.trace("NavigationManager - new active navigator: " + this.activeNavigator);
    };
    /**
     * Pushes a new navigator on the stack and activates it.
     *
     * @param navigator Navigator to push on the stack
     */
    NavigationManager.prototype.pushNavigator = function (navigator) {
        this.logger.trace('NavigationManager.pushNavigator');
        if (this.activeNavigator) {
            this.activeNativeNavigationStateSubscription.unsubscribe();
        }
        this.navigators.push(navigator);
        this.activateNavigator(navigator);
    };
    NavigationManager.prototype.popNavigator = function () {
        this.logger.trace('NavigationManager.popNavigator');
        if (this.navigators.length == 1) {
            throw new Error("The last navigator in the stack connot be closed.");
        }
        var poppedNavigator = this.navigators.pop();
        this.activeNativeNavigationStateSubscription.unsubscribe();
        this.activateNavigator(this.navigators[this.navigators.length - 1]);
        return poppedNavigator;
    };
    NavigationManager.prototype.findTopLevelOpenableView = function (component) {
        var componentName = component.componentType.name;
        var componentElement = component.location.nativeElement;
        var candidateElement = componentElement.firstElementChild;
        if (!(candidateElement instanceof vdom_1.TitaniumElement) || !this.isOpenableView(candidateElement.titaniumView)) {
            throw new Error("Could not find an openable Titanium view as the top-level element in component " + componentName);
        }
        return candidateElement.titaniumView;
    };
    /**
     * @param view
     */
    NavigationManager.prototype.isOpenableView = function (view) {
        if (!view) {
            return false;
        }
        return this.openableViews.has(view.apiName);
    };
    NavigationManager = __decorate([
        core_1.Injectable()
    ], NavigationManager);
    return NavigationManager;
}());
exports.NavigationManager = NavigationManager;
