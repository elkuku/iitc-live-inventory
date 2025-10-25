import * as Plugin from "iitcpluginkit"

import {DialogHelper} from './DialogHelper'

const PLUGIN_NAME = 'KuKuLiveInventory'

class IitcLiveInventory implements Plugin.Class {

    private dialogHelper: DialogHelper
    private dialog: JQuery | undefined

    init() {
        console.log(`KuKuLiveInventory ${VERSION}`)

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('./styles.css')

        this.dialogHelper = new DialogHelper(PLUGIN_NAME)

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
}

/**
 * use "main" to access you main class from everywhere
 * (same as window.plugin.IitcLiveInventory)
 */
export const main = new IitcLiveInventory()
Plugin.Register(main, "IitcLiveInventory")
