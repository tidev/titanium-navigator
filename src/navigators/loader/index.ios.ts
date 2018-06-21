import { RouterStateAdapterInterface } from '../../adapters';
import { NavigationWindowNavigator } from '../NavigationWindowNavigator';
import { NavigatorProvider } from '../NavigatorInterface';
import { loadCommonNavigatorProviders } from './common';

export function loadNavigatorProviders(stateAdapterFactory: () => RouterStateAdapterInterface): NavigatorProvider[] {
    return loadCommonNavigatorProviders(stateAdapterFactory).concat([
        { class: NavigationWindowNavigator, deps: [] }
    ]);
}
