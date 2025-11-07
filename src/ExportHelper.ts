import {IitcHelper} from './IitcHelper'
import {InventoryHelper} from './InventoryHelper'

import {ExportObject, ExportOptions, KeyInfo} from './types/Types'

export class ExportHelper {

    private iitcHelper: IitcHelper
    private inventoryHelper: InventoryHelper
    private keyInfo: Map<string, KeyInfo>

    constructor() {
        this.iitcHelper = new IitcHelper()
        this.inventoryHelper = new InventoryHelper()
    }

    async exportPortals(options: ExportOptions) {

        const exported = []
        const portals = this.findPortals(options.selectionMode)
        const exportKeys = options.fieldOptions.includes('keys')
        const exportKeyData = options.fieldOptions.includes('keyData')

        if (exportKeys || exportKeyData) {
            const inventory = await this.inventoryHelper.getInventory()
            this.keyInfo = this.inventoryHelper.getKeysInfo(inventory)
        }

        for (const portal of portals) {
            const data = portal.options.data

            const exportObject: ExportObject = {
                guid: portal.options.guid,
            }

            if (options.fieldOptions.includes('title')) {
                exportObject.title = data.title
            }

            if (options.fieldOptions.includes('lat')) {
                exportObject.lat = data.latE6 / 1e6
            }

            if (options.fieldOptions.includes('lng')) {
                exportObject.lng = data.lngE6 / 1e6
            }

            if (options.fieldOptions.includes('level')) {
                exportObject.level = data.level
            }

            if (options.fieldOptions.includes('team')) {
                exportObject.team = data.team
            }

            if (options.fieldOptions.includes('health')) {
                exportObject.health = data.health
            }

            if (options.fieldOptions.includes('resCount')) {
                exportObject.resCount = data.resCount
            }

            if (options.fieldOptions.includes('timestamp')) {
                exportObject.timestamp = Date.now()
            }

            if (exportKeys || exportKeyData) {
                const info = this.keyInfo.get(portal.options.guid)

                if (info) {
                    const keys: KeyInfo = {
                        total: info.total
                    }

                    if (exportKeyData) {
                        keys.atHand = info.atHand
                        keys.capsules = info.capsules
                    }

                    exportObject.keyInfo = keys
                }
            }

            exported.push(exportObject)
        }

        let exportString = ''

        // todo add more formats
        switch (options.format) {
            case 'json':
                exportString = JSON.stringify(exported, this.replacer, 2)
                break

            default:
                throw new Error(`Unsupported format ${options.format}`)
        }

        return exportString
    }

    private findPortals(method: string) {
        let portals: IITC.Portal[] = []

        switch (method) {
            case 'view':
                portals = this.iitcHelper.findPortalsInView()
                break
            case 'polygon':
                portals = this.iitcHelper.findPortalsInPolygons()
                break
            default:
                throw new Error(`Unsupported method: ${method}`)
        }

        if (portals.length === 0) throw new Error('No Portals found.')

        return portals
    }

    private replacer(key: any, value: any[] | Map<any, any>) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return value instanceof Map ? Object.fromEntries(value) : value
    }
}