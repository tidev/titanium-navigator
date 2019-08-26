import { RouterStateAdapterInterface } from '../../adapters';
import { NavigatorProvider } from '../NavigatorInterface';
import { NavigationWindowNavigator } from '../NavigationWindowNavigator';
import { TabGroupNavigator } from '../TabGroupNavigator';
import { WindowNavigator } from '../WindowNavigator';

export function loadCommonNavigatorProviders(stateAdapterFactory: () => RouterStateAdapterInterface): NavigatorProvider[] {
    return [
        { class: NavigationWindowNavigator, deps: [] },
        { class: TabGroupNavigator, deps: [stateAdapterFactory] },
        { class: WindowNavigator, deps: [] }
    ];
}
