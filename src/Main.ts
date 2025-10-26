import * as Plugin from "iitcpluginkit"

import {DialogHelper} from './DialogHelper'

const PLUGIN_NAME = 'KuKuLiveInventory'

class KuKuLiveInventory implements Plugin.Class {

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

    private showDialog(): void {
        if (!this.dialog) {
            this.dialog = this.dialogHelper.getDialog()
            this.dialog.on('dialogclose', () => {
                this.dialog = undefined
            })
        }
    }

    public helloWorld() {
        alert('Hello World!')
    }
}

/**
 * use "main" to access you main class from everywhere
 * (same as window.plugin.IitcLiveInventory)
 */
export const main = new KuKuLiveInventory()
Plugin.Register(main, PLUGIN_NAME)
