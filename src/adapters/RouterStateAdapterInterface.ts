export interface RouterStateAdapterInterface {
    updateRouterStateSnapshot(tab: Titanium.UI.Tab): void;
    applySnapshot(tab: Titanium.UI.Tab): void;
}
