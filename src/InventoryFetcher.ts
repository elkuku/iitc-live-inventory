/**
 * Written by EisFrei and Daniel Ondiordna
 * Modified by elkuku aka nikp3h
 */

import {InventoryParser} from './InventoryParser'
import {Inventory} from '../types/Types'

const KEY_SETTINGS = 'plugin-kuku-inventory'

export class InventoryFetcher {
    private inventory: Inventory.Items
    private expires = 0

    public async get(): Promise<Inventory.Items> {
        console.log(`Fetching inventory...`)

        if (this.inventory) {
            return this.inventory
        }

        if (this.loadInventoryFromLocalStorage()) {
            if (Date.now() > this.expires) {
                await this.refresh()
            }

            return this.inventory
        }

        await this.refresh()

        return this.inventory
    }

    public async refresh() {
        console.log('Refreshing inventory...')
        const response = await this.postAjax('getInventory', {lastQueryTimestamp: 0})

        console.log('Inventory data received')
        const parser = new InventoryParser()
        const items = parser.parse(response.result)
        this.saveInventoryToLocalStorage(items)
        this.inventory = items
    }

    private loadInventoryFromLocalStorage(): boolean {
        try {
            const storage: string = localStorage[KEY_SETTINGS]

            if (!storage || storage == '') return false

            const localData = JSON.parse(storage)

            if (!(localData instanceof Object)) return false

            if ('data' in localData && localData.data instanceof Object) {
                this.inventory = localData.data
            }

            if ('expires' in localData && typeof localData.expires == 'number') {
                this.expires = localData.expires
            }

            return true
        } catch (error) {
            console.log('loadInventory error', error)
        }

        return false
    }

    private saveInventoryToLocalStorage(items: Inventory.Items) {
        // Request data only once per 10 minutes, or we might hit a rate limit!
        this.expires = Date.now() + 10 * 60 * 1000

        localStorage[KEY_SETTINGS] = JSON.stringify({
            data: items,
            expires: this.expires,
        })
    }

    private postAjax(action: string, data: any): PromiseLike<any> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return new Promise((resolve, reject) => window.postAjax(
            action,
            data,
            (returnValue) => resolve(returnValue),
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            (_, textStatus, errorThrown) => reject(textStatus + ': ' + errorThrown)
        ))
    }

}
