import {Inventory, KeyInfo} from './types/Types'
import {IngressAPI} from './types/IngressApi'
import {IngressInventory} from './types/IngressInventory'

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

export class InventoryHelper {
    public async getInventory() {
        const inventory: Inventory.Items = {
            keys: [],
            boosts: [],
            weapons: [],
            mods: [],
            keyCapsules: [],
        }

        try {
            const items = await this.fetchInventory()

            for (const item of items) {
                // item is a #/&§$%%$ array...
                const object = item[2]

                let type = '', designation = '', level = 0
                let boost: Inventory.Boost,
                    weapon: Inventory.Weapon,
                    modulator: Inventory.Modulator,
                    key: Inventory.Key,
                    keyCapsule: Inventory.KeyCapsule

                if (Object.prototype.hasOwnProperty.call(object, 'resource')) {
                    type = object.resource.resourceType
                } else if (Object.prototype.hasOwnProperty.call(object, 'resourceWithLevels')) {
                    type = object.resourceWithLevels.resourceType
                    level = object.resourceWithLevels.level
                } else if (Object.prototype.hasOwnProperty.call(object, 'modResource')) {
                    type = 'modResource'
                } else {
                    console.warn('No resource', object)
                }

                if (Object.prototype.hasOwnProperty.call(object, 'timedPowerupResource')) {
                    designation = object.timedPowerupResource.designation
                } else {
                    //console.log('NO timedPowerupResource', object)
                }

                switch (type) {
                    case 'modResource':
                        modulator = {
                            type: object.modResource.resourceType,
                            rarity: object.modResource.rarity,
                        }

                        inventory.mods.push(modulator)
                        break
                    case 'ULTRA_STRIKE':
                    case 'EMP_BURSTER':
                        weapon = {
                            type: type,
                            level: level
                        }

                        inventory.weapons.push(weapon)
                        break
                    case 'FLIP_CARD':
                        weapon = {
                            type: object.flipCard.flipCardType,
                            level: 0
                        }

                        inventory.weapons.push(weapon)
                        break
                    case 'PORTAL_LINK_KEY':
                        key = {
                            guid: object.portalCoupler.portalGuid,
                            title: object.portalCoupler.portalTitle,
                        }

                        inventory.keys.push(key)
                        break
                    case 'KEY_CAPSULE':
                        keyCapsule = {
                            differentiator: object.moniker.differentiator,
                            count: object.container.currentCount,
                            keys: this.listKeysInCapsule(object.container.stackableItems),
                        }

                        inventory.keyCapsules.push(keyCapsule)
                        break
                    case 'PORTAL_POWERUP':
                        boost = {
                            type: designation
                        }

                        inventory.boosts.push(boost)
                        break
                    case 'CAPSULE':
                    case 'KINETIC_CAPSULE':
                    case 'POWER_CUBE':
                    case 'BOOSTED_POWER_CUBE':
                    case 'EMITTER_A'://?
                    case 'PLAYER_POWERUP'://apex
                    case 'ENTITLEMENT'://???
                    case 'DRONE':
                        // todo process item
                        break
                    default:
                        console.warn(`Unknown type${type}`, object)
                        break
                }
            }
        } catch (error) {
            const element = document.getElementById('iitc-inventory-content')
            const message: string = error.message ?? error
            if (element) element.innerHTML = `<div style="color:red">Error: ${message}</div>`
            console.error(message)
        }

        return inventory
    }

    public getKeysInfo(inventory: Inventory.Items) {
        const keyInfos = new Map<string, KeyInfo>()
        let keyInfo: KeyInfo | undefined

        for (const key of inventory.keys) {

            keyInfo = keyInfos.get(key.guid)

            keyInfo ??= {
                total: 0,
                atHand: 0,
                capsules: new Map<string, number>(),
            }

            keyInfo.atHand!++
            keyInfo.total++

            for (const capsule of inventory.keyCapsules) {
                if (!(keyInfo.capsules?.has(capsule.differentiator))) {
                    for (const k of capsule.keys) {
                        if (k.key.guid === key.guid) {
                            keyInfo.capsules!.set(capsule.differentiator, k.count)
                            keyInfo.total += k.count
                        }
                    }
                }
            }

            keyInfos.set(key.guid, keyInfo)
        }

        // Search for keys only in capsules
        for (const capsule of inventory.keyCapsules) {
            for (const k of capsule.keys) {
                if (keyInfos.has(k.key.guid)) {
                    keyInfo = keyInfos.get(k.key.guid)
                    if (false === keyInfo?.capsules?.has(capsule.differentiator)) {
                        keyInfo.capsules.set(capsule.differentiator, k.count)
                        keyInfo.total += k.count

                        keyInfos.set(k.key.guid, keyInfo)
                    }
                } else {
                    keyInfo = {
                        total: 0,
                        capsules: new Map<string, number>(),
                    }

                    keyInfo.capsules?.set(capsule.differentiator, k.count)
                    keyInfo.total += k.count

                    keyInfos.set(k.key.guid, keyInfo)
                }
            }
        }

        return keyInfos
    }

    private listKeysInCapsule(items: any): Inventory.KeyCapsuleItem[] {
        const keys = []
        for (const capsuleItem of items) {
            const coupler = capsuleItem.exampleGameEntity[2].portalCoupler
            const guid = coupler.portalGuid
            const key: Inventory.Key = {
                guid: guid,
                title: coupler.portalTitle,
            }
            const item: Inventory.KeyCapsuleItem = {
                key: key,
                count: capsuleItem.itemGuids.length,
            }

            keys.push(item)
        }
        return keys
    }

    private async fetchInventory():Promise<IngressInventory.Items> {
        const isEnabled = false // todo load data from cache

        let items: IngressInventory.Items

        if (isEnabled) {
            const response = await this.postAjax<IngressAPI.InventoryResponse>('getInventory', {lastQueryTimestamp: 0})

            items = response.result

        } else {
            // todo REMOVE TEST DATA
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const json = require('../testfiles/example.json')

            items = json.result
        }

        return items
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