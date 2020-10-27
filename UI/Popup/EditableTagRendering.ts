import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import TagRenderingConfig from "../../Customizations/JSON/TagRenderingConfig";
import {FixedUiElement} from "../Base/FixedUiElement";
import TagRenderingQuestion from "./TagRenderingQuestion";
import Translations from "../i18n/Translations";
import Combine from "../Base/Combine";
import TagRenderingAnswer from "./TagRenderingAnswer";
import State from "../../State";

export default class EditableTagRendering extends UIElement {
    private _tags: UIEventSource<any>;
    private _configuration: TagRenderingConfig;

    private _editMode: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    private _editButton: UIElement;

    private _question: UIElement;
    private _answer: UIElement;

    constructor(tags: UIEventSource<any>,
                configuration: TagRenderingConfig) {
        super(tags);
        this._tags = tags;
        this._configuration = configuration;

        this.ListenTo(this._editMode);
        this.ListenTo(State.state?.osmConnection?.userDetails)

        const self = this;

        this._answer = new TagRenderingAnswer(tags, configuration);
        
        this._answer.SetStyle("width:100%;")

        if (this._configuration.question !== undefined) {
            // 2.3em total width
            this._editButton = new FixedUiElement(
                "<img style='width: 1.3em;height: 1.3em;padding: 0.5em;border-radius: 0.65em;border: solid black 1px;font-size: medium;float: right;' " +
                "src='./assets/pencil.svg' alt='edit'>")
                .onClick(() => {
                    self._editMode.setData(true);
                });


            // And at last, set up the skip button
            const cancelbutton =
                Translations.t.general.cancel.Clone()
                    .SetClass("cancel")
                    .onClick(() => {
                        self._editMode.setData(false)
                    });

            this._question = new TagRenderingQuestion(tags, configuration,
                () => {
                    self._editMode.setData(false)
                },
                cancelbutton)
        }
    }


    InnerRender(): string {

        if (this._editMode.data) {
            return this._question.Render();
        }
        
        if(this._configuration.GetRenderValue(this._tags.data)=== undefined){
            return "";
        }
        
        if(!this._configuration?.condition?.matchesProperties(this._tags.data)){
            return "";
        }

        return new Combine([this._answer,
            (State.state?.osmConnection?.userDetails?.data?.loggedIn ?? true) ? this._editButton : undefined
        ]).SetClass("answer")
            .Render();
    }

}