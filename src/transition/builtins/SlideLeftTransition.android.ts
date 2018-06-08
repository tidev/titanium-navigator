import { AbstractTransition } from '../AbstractTransition';
import { NavigationTransition } from '../NavigationTransition';

export class SlideLeftTransition extends AbstractTransition {
    public name: string = 'slideLeft';

    public initializeAnimations(futureView: Titanium.UI.View, currentView: Titanium.UI.View, transition: NavigationTransition) {
        this.openWindowOptions.activityEnterAnimation = Titanium.Android.R.anim.slide_in_left;
    }
}
