import { TitaniumElement } from 'titanium-vdom';

export interface ComponentAdapterInterface {
    getComponentName(component: any): string;
    getTopmostTitaniumElement<T extends Titanium.UI.View>(component: any): TitaniumElement<T>;
    detachComponent(component: any): void;
}
