// @ts-expect-error "Import attributes are only supported when the --module option is set to esnext, nodenext, or preserve"
import dialogTemplate from './templates/dialog.hbs' with {type: 'text'}

import * as Handlebars from 'handlebars'

export class DialogHelper {
    public constructor(
        private pluginName: string
    ) {}

    public getDialog(): JQuery {
        const template: HandlebarsTemplateDelegate = Handlebars.compile(dialogTemplate)

        const data = {}
        const dialog = window.dialog({
            id: this.pluginName,
            title: 'Export',
            html: template(data),
        }).parent()

        return dialog
    }
}