import * as Plugin from "iitcpluginkit"

import {DialogHelper} from './DialogHelper'
import {InventoryHelper} from './InventoryHelper'

const PLUGIN_NAME = 'KuKuInventory'

class KuKuInventory implements Plugin.Class {

    private dialogHelper: DialogHelper
    private dialog: JQuery | undefined

    private inventoryHelper: InventoryHelper

    init() {
        console.log(`${PLUGIN_NAME} ${VERSION}`)

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('./styles.css')

        this.dialogHelper = new DialogHelper(PLUGIN_NAME, 'Inventory')
        this.inventoryHelper = new InventoryHelper()

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

    public showPanel(name:string) {
        this.dialogHelper.showPanel(name)
    }

    public async refresh() {
        const resos = await this.inventoryHelper.getResonatorsInfo()
        const weapons = await this.inventoryHelper.getWeaponsInfo()
        const modulators = await this.inventoryHelper.getModsInfo()

        const boosts = await this.inventoryHelper.getBoostsInfo()

        this.dialogHelper.updateDialog(resos, weapons, modulators, boosts)
    }
}

export const main = new KuKuInventory()

Plugin.Register(main, PLUGIN_NAME)
