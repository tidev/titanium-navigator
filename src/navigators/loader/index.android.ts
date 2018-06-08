import { RouterStateAdapterInterface } from '../../adapters';
import { NavigatorProvider } from '../NavigatorInterface';
import { loadCommonNavigatorProviders } from './common';

export function loadNavigatorProviders(stateAdapter: RouterStateAdapterInterface): NavigatorProvider[] {
    return loadCommonNavigatorProviders(stateAdapter).concat([
        // TODO: Add DrawerLayoutNavigator
    ]);
}
