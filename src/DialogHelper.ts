import * as Handlebars from 'handlebars'
import {HelperOptions} from 'handlebars'

// @ts-expect-error "Import attributes are only supported when the --module option is set to esnext, nodenext, or preserve"
import dialogTemplate from './templates/dialog.hbs' with {type: 'text'}

// @ts-expect-error "Import attributes are only supported when the --module option is set to esnext, nodenext, or preserve"
import itemsContainerTemplate from './templates/_items-container.hbs' with {type: 'text'}

Handlebars.registerHelper('eachInMap', (map: Map<any, any>, block: HelperOptions) => {
    let out = ''
    if (map && map instanceof Map) {
        for (const [key, value] of map) {
            out += block.fn({key, value})
        }
    }
    return out
})

export class DialogHelper {
    public constructor(
        private pluginName: string,
        private title: string,
    ) {}

    public getDialog(): JQuery {
        const template: HandlebarsTemplateDelegate = Handlebars.compile(dialogTemplate)

        const data = {
            plugin: 'window.plugin.' + this.pluginName,
            prefix: this.pluginName,
        }

        return window.dialog({
            id: this.pluginName,
            title: this.title,
            html: template(data),
        }).parent()
    }

    updateDialog(resonators: Map<string, number>, weapons: Map<string, number>) {
        const itemsTemplate: HandlebarsTemplateDelegate = Handlebars.compile(itemsContainerTemplate)

        const resosContainer = document.getElementById(this.pluginName + '-Resonators-Container') as Element
        resosContainer.innerHTML = itemsTemplate({items: resonators})

        const weaponsContainer = document.getElementById(this.pluginName + '-Weapons-Container') as Element
        weaponsContainer.innerHTML = itemsTemplate({items: weapons})


        const textarea = document.getElementById(this.pluginName + '-Debug') as Element

        textarea.innerHTML = 'HI'
    }
}