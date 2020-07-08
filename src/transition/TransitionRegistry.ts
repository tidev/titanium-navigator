import { SlideLeftTransition } from './builtins';
import { TransitionType } from './NavigationTransition';
import { TransitionConstructor } from './TransitionInterface';

export class TransitionRegistry {
    private static _instance: TransitionRegistry;

    private transitions: Map<string, TransitionConstructor>;

    private constructor() {
        this.transitions = new Map();

        this.loadBuiltIns();
    }

    public static getInstance(): TransitionRegistry {
        if (!this._instance) {
            this._instance = new TransitionRegistry();
        }

        return this._instance;
    }

    public registerTransitionClass(name: string, transitionClass: TransitionConstructor): void {
        this.transitions.set(name, transitionClass);
    }

    public hasTransition(name: string): boolean {
        return this.transitions.has(name);
    }

    public getTransitionClass(name: string): TransitionConstructor {
        const transitionClass = this.transitions.get(name);
        if (!transitionClass) {
            throw new Error(`No transition known named "${name}".`);
        }
        return transitionClass;
    }

    private loadBuiltIns(): void {
        this.registerTransitionClass(TransitionType.SlideLeft, SlideLeftTransition);
    }
}
