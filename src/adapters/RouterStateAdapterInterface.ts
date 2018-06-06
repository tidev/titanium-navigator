export interface RouterStateAdapterInterface {
    back(): void;
    updateRouterStateSnapshot(tab: Titanium.UI.Tab): void;
    applySnapshot(tab: Titanium.UI.Tab): void;
}
