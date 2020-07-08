import { RouterStateAdapterInterface } from '../../adapters';
import { NavigatorProvider } from '../NavigatorInterface';
import { loadCommonNavigatorProviders } from './common';

export interface StateAdapterFactory {
    (tabGroup: Titanium.UI.TabGroup): RouterStateAdapterInterface;
}

export function loadNavigatorProviders(stateAdapterFactory: StateAdapterFactory): NavigatorProvider[] {
    return loadCommonNavigatorProviders(stateAdapterFactory);
}
