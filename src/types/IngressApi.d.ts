import {IngressInventory} from './IngressInventory'

declare namespace IngressAPI {
    export interface InventoryResponse {
        result: IngressInventory.Items
    }
}