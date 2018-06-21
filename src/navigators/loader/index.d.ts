import { RouterStateAdapterInterface } from '../../adapters';
import { NavigatorProvider } from '../NavigatorInterface';

export function loadCommonNavigatorProviders(stateAdapterFactory: () => RouterStateAdapterInterface): NavigatorProvider[];