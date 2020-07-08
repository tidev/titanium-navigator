import { NavigatorProvider } from '../NavigatorInterface';
import { NavigationWindowNavigator } from '../NavigationWindowNavigator';
import { TabGroupNavigator } from '../TabGroupNavigator';
import { WindowNavigator } from '../WindowNavigator';
import { StateAdapterFactory } from './index';

export function loadCommonNavigatorProviders(stateAdapterFactory: StateAdapterFactory): NavigatorProvider[] {
    return [
        { class: NavigationWindowNavigator, deps: [] },
        { class: TabGroupNavigator, deps: [stateAdapterFactory] },
        { class: WindowNavigator, deps: [] }
    ];
}
