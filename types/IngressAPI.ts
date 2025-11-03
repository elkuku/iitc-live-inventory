import {IngressInventory} from './IngressInventory'

export namespace IngressAPI {
    export interface InventoryResponse {
        result: IngressInventory.Items
    }
}