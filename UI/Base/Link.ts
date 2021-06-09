import Translations from "../i18n/Translations";
import BaseUIElement from "../BaseUIElement";
import {UIEventSource} from "../../Logic/UIEventSource";


export default class Link extends BaseUIElement {
    private readonly _element: HTMLElement;

    constructor(embeddedShow: BaseUIElement | string, target: string | UIEventSource<string>, newTab: boolean = false) {
        super();
        const _embeddedShow = Translations.W(embeddedShow);


        const el = document.createElement("a")
        
        if(typeof target === "string"){
            el.href = target
        }else{
            target.addCallbackAndRun(target => {
                el.target = target;
            })
        }
        if (newTab) {
            el.target = "_blank"
        }
        el.appendChild(_embeddedShow.ConstructElement())
        this._element = el
    }

    protected InnerConstructElement(): HTMLElement {

        return this._element;
    }

}