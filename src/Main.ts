import * as Plugin from "iitcpluginkit"

import {DialogHelper} from './DialogHelper'

const PLUGIN_NAME = 'KuKuInventory'

class KuKuInventory implements Plugin.Class {

    private dialogHelper: DialogHelper
    private dialog: JQuery | undefined

    init() {
        console.log(`${PLUGIN_NAME} ${VERSION}`)

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('./styles.css')

        this.dialogHelper = new DialogHelper(PLUGIN_NAME, 'Inventory')

        this.createButtons()
    }

    private createButtons(): void {
        $('#toolbox').append(
            $('<a>', {
                text: 'KuKuInventory',
                click: () => this.showDialog()
            })
        )
    }

    private async showDialog(): Promise<void> {
        if (!this.dialog) {
            this.dialog = this.dialogHelper.getDialog()
            this.dialog.on('dialogclose', () => {
                this.dialog = undefined
            })

            await this.refresh()
        }
    }

    public showPanel(name: string) {
        this.dialogHelper.showPanel(name)
    }

    public async refresh() {
        await this.dialogHelper.updateDialog()
    }
}

export const main = new KuKuInventory()

Plugin.Register(main, PLUGIN_NAME)
