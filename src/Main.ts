import * as Plugin from "iitcpluginkit"

import {DialogHelper} from './DialogHelper'

const PLUGIN_NAME = 'KuKuInventory'

class KuKuInventory implements Plugin.Class {

//    public syncField: object

    private dialogHelper: DialogHelper
    private dialog: JQuery | undefined

    //  private capsuleNames: Map<string, string>

    init() {
        console.log(`${PLUGIN_NAME} ${VERSION}`)

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('./styles.css')

        this.dialogHelper = new DialogHelper(PLUGIN_NAME, 'Inventory')

        this.createButtons()

        // const storedMap = this.loadMapFromLocalStorage('capsuleNames')


        /*
        const sync = window.plugin.sync

        if (!sync) {
            console.warn('Sync plugin not available')

            return
        }

        sync.registerMapForSync(PLUGIN_NAME, 'syncField', main.onSyncUpdate, main.onSyncInitialized)
        console.log('Registered with Sync plugin')

        this.capsuleNames = new Map()
        this.syncField = {iii: 'uuuu'}

        console.log('init', this.syncField)
        */

    }

    /*
        public onSyncInitialized(aaa: unknown, bbb: unknown) {
            console.log('onSyncInitialized', aaa, bbb)
            console.log('Sync ready, pushing current data...')
            console.log('onSyncInitialized', this.syncField)
            console.log('onSyncInitialized', main.syncField)
            //  main.setCapsuleName('AAA', 'BBB')

            main.save()
        }
    */
    //pluginName, fieldName, null, fullUpdated
    /*
    public onSyncUpdate(pluginName: string, fieldName: string, nullValue: unknown, fullUpdated: boolean) {
        console.log('Sync update:', pluginName, fieldName, nullValue, fullUpdated)
        console.log('onSyncUpdate', this.syncField)
        console.log('onSyncUpdate', main.syncField)
        if (fieldName !== 'capsuleNames') return

        // this.capsuleNames = this.deserialize(data)
        console.log('Received sync update', this.capsuleNames)
        this.onDataUpdated()
    }
*/
    /** Called when local and remote data need merging
     private onSyncMerge({ name, local, remote, resolve }: any) {
     if (name !== 'capsuleNames') return

     const merged = { ...local, ...remote }
     resolve(merged)
     }
     */
    public showPanel(name: string) {
        this.dialogHelper.showPanel(name)
    }

    public async refresh() {
        await this.dialogHelper.refresh()
    }

    public storeCapsuleNames() {
        this.dialogHelper.storeCapsuleNames()

        // todo: reload
    }

    private createButtons(): void {
        $('#toolbox').append(
            $('<a>', {
                text: 'KInventory',
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

            await this.dialogHelper.updateDialog()
        }
    }


    /** Convert Map -> plain object for sync */
    /*
    private serialize(): Record<string, string> {
        const object: Record<string, string> = {}
        for (const [guid, data] of this.capsuleNames.entries()) {
            object[guid] = data
        }
        console.log('serialized', object)
        return object
    }
*/
    /** Convert plain object -> Map after sync */
    /*
    private deserialize(object: Record<string, string>): Map<string, string> {
        return new Map(Object.entries(object))
    }
*/
    /*
        public setCapsuleName(guid: string, title: string) {
            this.capsuleNames.set(guid, title)
            this.saveMapToLocalStorage('capsuleNames', this.capsuleNames)

           // this.save()
        }
    */
    /** Push changes to Sync plugin */
    /*
    private save() {
        const sync = window.plugin.sync
        if (sync) {
            sync.updateMap(PLUGIN_NAME, 'syncField', ['iii'])
            // sync.updateMap(PLUGIN_NAME, 'capsuleNames', this.serialize())
            console.log('dummy', this.serialize())
            console.log('Data saved to Sync')
        }
    }
*/

    /** Called when synced data arrives */
    /*
    private onDataUpdated() {
        console.log('Updated capsule names:', this.capsuleNames)
    }
    */
}

export const main = new KuKuInventory()

Plugin.Register(main, PLUGIN_NAME)
