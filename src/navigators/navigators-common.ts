import { NavigatorContructor } from './NavigatorInterface';
import { TabGroupNavigator } from './TabGroupNavigator';
import { WindowNavigator } from './WindowNavigator';

export function loadCommonNavigators(): any[] {
    return [
        TabGroupNavigator
    ];
}
