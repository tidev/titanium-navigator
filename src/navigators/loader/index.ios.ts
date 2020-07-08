import { NavigatorProvider } from '../NavigatorInterface';
import { loadCommonNavigatorProviders } from './common';
import { StateAdapterFactory } from './index';

export function loadNavigatorProviders(stateAdapterFactory: StateAdapterFactory): NavigatorProvider[] {
    return loadCommonNavigatorProviders(stateAdapterFactory).concat([

    ]);
}
