import { AbstractTransition } from '../AbstractTransition';
import { NavigationTransition } from '../NavigationTransition';

export declare class SlideLeftTransition extends AbstractTransition {
    public name: string;
    public initializeAnimations(futureView: Titanium.UI.View, currentView: Titanium.UI.View, transition: NavigationTransition): void;
}