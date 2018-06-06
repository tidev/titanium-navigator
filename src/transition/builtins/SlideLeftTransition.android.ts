import { NavigationTransition } from '../NavigationTransition';
import { AbstractTransition } from './AbstractTransition';

export class SlideLeftTransition extends AbstractTransition {
    public name: string = 'slideLeft';

    public initializeAnimations(futureView: Titanium.UI.View, currentView: Titanium.UI.View, transition: NavigationTransition) {
        this.openWindowOptions.activityEnterAnimation = Titanium.Android.R.anim.slide_in_left;
    }
}
