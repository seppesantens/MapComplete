import {Utils} from "../Utils";
import {UIEventSource} from "../Logic/UIEventSource";

/**
 * A thin wrapper around a html element, which allows to generate a HTML-element.
 * 
 * Assumes a read-only configuration, so it has no 'ListenTo'
 */
export default abstract class BaseUIElement {

    private clss: Set<string> = new Set<string>();
    private style: string;
    private _onClick: () => void;
    private _onHover: UIEventSource<boolean>;

    protected _constructedHtmlElement: HTMLElement;
    

    protected abstract InnerConstructElement(): HTMLElement;

    public onClick(f: (() => void)) {
        this._onClick = f;
        this.SetClass("clickable")
        if(this._constructedHtmlElement !== undefined){
            this._constructedHtmlElement.onclick = f;
        }
        return this;
    }

    public IsHovered(): UIEventSource<boolean> {
        if (this._onHover !== undefined) {
            return this._onHover;
        }
        // Note: we just save it. 'Update' will register that an eventsource exist and install the necessary hooks
        this._onHover = new UIEventSource<boolean>(false);
        return this._onHover;
    }


    AttachTo(divId: string) {
        let element = document.getElementById(divId);
        if (element === null) {
            throw "SEVERE: could not attach UIElement to " + divId;
        }

        while (element.firstChild) {
            //The list is LIVE so it will re-index each call
            element.removeChild(element.firstChild);
        }
        const el = this.ConstructElement();
        if(el !== undefined){
            element.appendChild(el)
        }

        return this;
    }
    /**
     * Adds all the relevant classes, space seperated
     * @param clss
     * @constructor
     */
    public SetClass(clss: string) {
        const all = clss.split(" ").map(clsName => clsName.trim());
        let recordedChange = false;
        for (const c of all) {
            if (this.clss.has(clss)) {
                continue;
            }
            this.clss.add(c);
            recordedChange = true;
        }
        if (recordedChange) {
            this._constructedHtmlElement?.classList.add(...Array.from(this.clss));
        }
        return this;
    }

    public RemoveClass(clss: string): BaseUIElement {
        if (this.clss.has(clss)) {
            this.clss.delete(clss);
            this._constructedHtmlElement?.classList.remove(clss)
        }
        return this;
    }

    public SetStyle(style: string): BaseUIElement {
        this.style = style;
        if(this._constructedHtmlElement !== undefined){
            this._constructedHtmlElement.style.cssText = style;
        }
        return this;
    }
    /**
     * The same as 'Render', but creates a HTML element instead of the HTML representation
     */
    public ConstructElement(): HTMLElement {
        if (Utils.runningFromConsole) {
            return undefined;
        }

        if (this._constructedHtmlElement !== undefined) {
            return this._constructedHtmlElement
        }


        const el = this.InnerConstructElement();

        if(el === undefined){
            return undefined;
        }

        this._constructedHtmlElement = el;
        const style = this.style
        if (style !== undefined && style !== "") {
            el.style.cssText = style
        }
        if (this.clss.size > 0) {
            try{
                el.classList.add(...Array.from(this.clss))
            }catch(e){
                console.error("Invalid class name detected in:", Array.from(this.clss).join(" "),"\nErr msg is ",e)
            }
        }

        if (this._onClick !== undefined) {
            const self = this;
            el.onclick = (e) => {
                // @ts-ignore
                if (e.consumed) {
                    return;
                }
                self._onClick();
                // @ts-ignore
                e.consumed = true;
            }
            el.style.pointerEvents = "all";
            el.style.cursor = "pointer";
        }

        if (this._onHover !== undefined) {
            const self = this;
            el.addEventListener('mouseover', () => self._onHover.setData(true));
            el.addEventListener('mouseout', () => self._onHover.setData(false));
        }

        if (this._onHover !== undefined) {
            const self = this;
            el.addEventListener('mouseover', () => self._onHover.setData(true));
            el.addEventListener('mouseout', () => self._onHover.setData(false));
        }

        return el
    }
}