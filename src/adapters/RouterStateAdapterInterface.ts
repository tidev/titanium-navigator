export interface RouterStateAdapterInterface {
    activate(): void;
    deactivate(): void;
    updateRouterStateSnapshot(tab: Titanium.UI.Tab): void;
    applySnapshot(tab: Titanium.UI.Tab): void;
}
