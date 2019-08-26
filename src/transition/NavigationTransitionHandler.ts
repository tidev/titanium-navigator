import { NavigationTransition } from './NavigationTransition';
import { TransitionRegistry } from './TransitionRegistry';

/**
 * Handles applying transitions from one window to another during navigation.
 */
export class NavigationTransitionHandler {

    private transitionRegistry: TransitionRegistry;

    constructor() {
        this.transitionRegistry = TransitionRegistry.getInstance();
    }

    /**
     * Prepares a transition to a view that will be used when the view is opened.
     *
     * @param view
     * @param transition
     * @param openWindowOptions
     */
    public prepareTransition(futureView: any, currentView: any, transition: NavigationTransition, openWindowOptions: openWindowParams): void {
        if (!this.transitionRegistry.hasTransition(transition.type)) {
            throw new Error(`Invalid transition specified, ${transition.type} is not a known transition name.`);
        }

        const transitionClass = this.transitionRegistry.getTransitionClass(transition.type);
        const transitionInstance = new transitionClass(openWindowOptions);
        transitionInstance.initializeAnimations(futureView, currentView, transition);
    }
}
