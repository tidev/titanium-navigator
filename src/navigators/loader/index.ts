import { RouterStateAdapterInterface } from '../../adapters';
import { NavigatorProvider } from '../NavigatorInterface';
import { loadCommonNavigatorProviders } from './common';

export function loadNavigatorProviders(stateAdapterFactory: () => RouterStateAdapterInterface): NavigatorProvider[] {
    return loadCommonNavigatorProviders(stateAdapterFactory);
}
