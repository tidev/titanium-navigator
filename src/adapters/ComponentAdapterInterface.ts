import { OpenableViewInterface } from '../NavigationManager';

export interface ComponentAdapterInterface {
    getComponentName(component: any): string;
    findTopLevelOpenableView(component: any): OpenableViewInterface;
    detachCcomponent(component: any): void;
}
