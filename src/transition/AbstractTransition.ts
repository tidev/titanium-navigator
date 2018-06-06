import { NavigationTransition } from './NavigationTransition';
import { TransitionInterface } from './TransitionInterface';

export abstract class AbstractTransition implements TransitionInterface {
    public abstract name: string;

    public defaultDuration: number = 350;

    constructor(protected openWindowOptions: openWindowParams) {

    }

    public abstract initializeAnimations(futureView: Titanium.UI.View, currentView: Titanium.UI.View, transition: NavigationTransition): void;
}
