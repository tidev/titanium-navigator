import { RouterStateAdapterInterface } from './RouterStateAdapterInterface';
import { RouterStateSnapshotInterface } from './RouterStateSnapshotInterface';

/**
 * An adapter for saving and restoring router state snapshots when navigating
 * inside tab groups.
 */
export abstract class AbstractRouterStateAdapter implements RouterStateAdapterInterface {

    /**
     * Map of tabs and their current router state snapshot.
     */
    protected routerSnapshots: Map<Titanium.UI.Tab, RouterStateSnapshotInterface> = new Map();

    /**
     * The routing snapshot when the tab group is opnened, used as the
     * initial snapshot for each tab.
     */
    protected initialSnapshot: RouterStateSnapshotInterface | null = null;

    /**
     * Updates the current router state snpashot for the given tab.
     *
     * @param tab Tab to associate the current router state snapshot with.
     */
    public updateRouterStateSnapshot(tab: Titanium.UI.Tab): void {
        const snapshot = this.createSnapshot();
        this.routerSnapshots.set(tab, snapshot);
    }

    /**
     * Applies the router states from the stored snapshot of the given tab.
     *
     * @param tab Tab for which to look up and apply previously stored router states.
     */
    public applySnapshot(tab: Titanium.UI.Tab): void {
        if (!tab || tab.apiName !== 'Ti.UI.Tab') {
            throw new Error('Invalid tab received while trying to apply router snapshot after switching tab.');
        }

        let storedSnapshot = this.routerSnapshots.get(tab);
        if (!storedSnapshot) {
            storedSnapshot = this.initialSnapshot!;
            this.routerSnapshots.set(tab, storedSnapshot);
        }

        const currentSnapshot = this.createSnapshot();
        if (!storedSnapshot.isEqual(currentSnapshot)) {
            this.restoreStateFromSnapshot(storedSnapshot);
        }
    }

    /**
     * Restores the snapshotted state back to the router.
     *
     * @param snapshot The snapshot to apply the state from
     */
    protected abstract restoreStateFromSnapshot(snapshot: RouterStateSnapshotInterface): void;

    /**
     * Creates a new router state snapshot from the current location history and any other
     * relevant data needed to restore the state at a later time.
     *
     * @return The created snpashot of the current router states.
     */
    protected abstract createSnapshot(): RouterStateSnapshotInterface;
}
