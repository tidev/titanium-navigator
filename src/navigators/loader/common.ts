import { RouterStateAdapterInterface } from '../../adapters';
import { NavigatorProvider } from '../NavigatorInterface';
import { TabGroupNavigator } from '../TabGroupNavigator';
import { WindowNavigator } from '../WindowNavigator';

export function loadCommonNavigatorProviders(stateAdapterFactory: () => RouterStateAdapterInterface): NavigatorProvider[] {
    return [
        { class: TabGroupNavigator, deps: [stateAdapterFactory] },
        { class: WindowNavigator, deps: [] }
    ];
}
