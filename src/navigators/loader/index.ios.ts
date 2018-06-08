import { RouterStateAdapterInterface } from '../../adapters';
import { NavigationWindowNavigator } from '../NavigationWindowNavigator';
import { NavigatorProvider } from '../NavigatorInterface';
import { loadCommonNavigatorProviders } from './common';

export function loadNavigatorProviders(stateAdapter: RouterStateAdapterInterface): NavigatorProvider[] {
    return loadCommonNavigatorProviders(stateAdapter).concat([
        { class: NavigationWindowNavigator, deps: [] }
    ]);
}
