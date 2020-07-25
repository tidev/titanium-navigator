export function deviceRuns(name: string): boolean {
    if (name === 'ios') {
        return ['iphone', 'ipad'].indexOf(Ti.Platform.osname) !== -1;
    }

    return name === Ti.Platform.osname;
}

/**
 * Ti.App with internal members that are not documented.
 */
export interface TiAppInternal extends Ti.App {
    /**
     * Restarts the UI
     */
    _restart: PatchedInternalRestart;
}

/**
 * Patched `_restart` function for LiveView fix on Android.
 */
export interface PatchedInternalRestart {
    (): void;
    /**
     * True if the NavigationManager applied the pach.
     */
    __navigatorPatch?: boolean;
    /**
     * Flag to track LiveView triggered UI restarts.
     */
    __liveViewRestart?: boolean;
}