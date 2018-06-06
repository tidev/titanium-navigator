import { NavigationTransition } from '../NavigationTransition';
import { AbstractTransition } from './AbstractTransition';

export declare class SlideLeftTransition extends AbstractTransition {
    public name: string;
    public initializeAnimations(futureView: Titanium.UI.View, currentView: Titanium.UI.View, transition: NavigationTransition): void;
}