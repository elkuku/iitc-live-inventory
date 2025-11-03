/**
 * Written by EisFrei and Daniel Ondiordna
 * Modified by elkuku aka nikp3h
 */

import {InventoryParser} from './InventoryParser'
import {Inventory} from '../types/Types'
import {IngressAPI} from '../types/IngressAPI'
import {Utility} from './Utility'

const KEY_SETTINGS = 'plugin-kuku-inventory'

declare global {
    interface Window {
        postAjax: <T>(
            action: string,
            data: unknown,
            onSuccess: (returnValue: T) => void,
            onError: (xhr: unknown, status: string, error: string) => void
        ) => void
    }
}

export class InventoryFetcher {
    private inventory: Inventory.Items
    private expires = 0

    public async getInventory(): Promise<Inventory.Items> {
        console.log('Fetching inventory...')

        if (this.loadInventoryFromLocalStorage()) {
            console.log('... from local storage...')
            if (Date.now() > this.expires) {
                console.log(`... has expired ${Utility.formatTimeString(this.expires - Date.now())} :( ... refreshing...`)

                try {
                    return await this.refresh()
                } catch (error) {
                    console.error(error)
                    return this.inventory
                }
            }

            console.log(`OK - still has ${Utility.formatTimeString(this.expires - Date.now())}`)

            return this.inventory
        } else {
            console.log('... no local storage :(')
        }

        return await this.refresh()
    }

    public async refresh() {
        console.log('Refreshing inventory...')
        const response = await this.postAjax<IngressAPI.InventoryResponse>('getInventory', {lastQueryTimestamp: 0})

        if (response.result.length === 0) {
            throw new Error('Failed to refresh inventory')
        }

        console.log('Inventory data received')
        const parser = new InventoryParser()
        const items = parser.parse(response.result)
        this.saveInventoryToLocalStorage(items)
        this.inventory = items

        return this.inventory
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

    private postAjax<T>(action: string, data: unknown): Promise<T> {
        return new Promise((resolve, reject) =>
            window.postAjax<T>(
                action,
                data,
                (returnValue) => resolve(returnValue),
                (_: unknown, status: string, error: string) =>
                    reject(new Error(`${status}: ${error}`))
            )
        )
    }
}
