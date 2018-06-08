import { RouterStateAdapterInterface } from '../../adapters';
import { NavigatorProvider } from '../NavigatorInterface';
import { TabGroupNavigator } from '../TabGroupNavigator';
import { WindowNavigator } from '../WindowNavigator';

export function loadCommonNavigatorProviders(stateAdapter: RouterStateAdapterInterface): NavigatorProvider[] {
    return [
        { class: TabGroupNavigator, deps: [stateAdapter] },
        { class: WindowNavigator, deps: [] }
    ];
}
