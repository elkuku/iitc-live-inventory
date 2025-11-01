import {Inventory, KeyInfo} from '../types/Types'
import {IngressInventory} from '../types/IngressInventory'

export class InventoryHelper {
    private inventory: Inventory.Items

    public async getInventory() {
        if (this.inventory) {
            return this.inventory
        }

        const inventory: Inventory.Items = {
            resonators: [],
            weapons: [],
            mods: [],
            keys: [],
            cubes: [],
            boosts: [],
            keyCapsules: [],
        }

        try {
            const items: IngressInventory.Items[] = await this.fetchInventory()

            for (const whyIsThisAnArray of items) {
                // This is a #/&§$%%$ array...
                const object = whyIsThisAnArray[2]

                let type = '', designation = '', level = 0

                if (Object.prototype.hasOwnProperty.call(object, 'resource')) {
                    type = object.resource.resourceType
                } else if (Object.prototype.hasOwnProperty.call(object, 'resourceWithLevels')) {
                    type = object.resourceWithLevels.resourceType
                    level = object.resourceWithLevels.level
                } else if (Object.prototype.hasOwnProperty.call(object, 'modResource')) {
                    type = 'modResource'
                } else {
                    console.warn('Unknown resource type in object', object)
                }

                if (Object.prototype.hasOwnProperty.call(object, 'timedPowerupResource')) {
                    designation = object.timedPowerupResource.designation
                }

                switch (type) {
                    case 'EMITTER_A': // This is a so-called "resonator"
                        inventory.resonators.push({
                            level: level
                        })

                        break
                    case 'ULTRA_STRIKE':
                    case 'EMP_BURSTER':
                        inventory.weapons.push({
                            type: type,
                            level: level
                        })

                        break
                    case 'FLIP_CARD':
                        inventory.weapons.push({
                            type: object.flipCard.flipCardType,
                            level: 0
                        })

                        break
                    case 'PORTAL_LINK_KEY': {
                        const parts = object.portalCoupler.portalLocation.split(',')
                        inventory.keys.push({
                            guid: object.portalCoupler.portalGuid,
                            title: object.portalCoupler.portalTitle,
                            lat: this.convertHexToSignedFloat(parts[0]),
                            lng: this.convertHexToSignedFloat(parts[1]),
                        })

                        break
                    }
                    case 'KEY_CAPSULE':
                        inventory.keyCapsules.push({
                            differentiator: object.moniker.differentiator,
                            count: object.container.currentCount,
                            keys: this.listKeysInCapsule(object.container.stackableItems),
                        })

                        break
                    case 'PLAYER_POWERUP': // apex
                        if (object.playerPowerupResource.playerPowerupEnum === 'APEX') {
                            inventory.boosts.push({
                                type: 'APEX'
                            })
                        } else {
                            console.warn('Unknown PLAYER_POWERUP', object)
                        }
                        break
                    case 'PORTAL_POWERUP':
                        inventory.boosts.push({
                            type: designation
                        })

                        break
                    case 'modResource':
                        inventory.mods.push({
                            type: object.modResource.resourceType,
                            rarity: object.modResource.rarity,
                        })

                        break
                    case 'POWER_CUBE':
                        inventory.cubes.push({
                            level: level
                        })
                        break
                    case 'BOOSTED_POWER_CUBE': // hyper cube
                        inventory.cubes.push({
                            level: 9
                        })
                        break
                    case 'CAPSULE': // TODO process capsules
                    case 'KINETIC_CAPSULE':
                    case 'ENTITLEMENT': // ???
                    case 'DRONE':
                        // todo process those items (?)
                        // console.log(`todo type: ${type}`, object)
                        break
                    default:
                        console.warn(`Unknown type: ${type}`, object)
                        break
                }
            }
        } catch (error) {
            const element = document.getElementById('iitc-inventory-content')
            const message: string = error.message ?? error
            if (element) element.innerHTML = `<div style="color:red">Error: ${message}</div>`
            console.error(message)
        }

        this.inventory = inventory

        return inventory
    }

    public async getKeysInfo(): Promise<Map<string, KeyInfo>> {
        const inventory = await this.getInventory()
        const keyInfos = new Map<string, KeyInfo>()
        let keyInfo: KeyInfo | undefined

        for (const key of inventory.keys) {

            keyInfo = keyInfos.get(key.guid)

            keyInfo ??= {
                total: 0,
                atHand: 0,
                portal: {
                    guid: key.guid,
                    title: key.title,
                    lat: key.lat,
                    lng: key.lng,
                },
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
                        portal: {
                            guid: k.key.guid,
                            title: k.key.title,
                            lat: k.key.lat,
                            lng: k.key.lng,
                        },
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

    /**
     * @return
     * [
     *  {
     *     {WEAPON-TYPE}-{LEVEL}: {COUNT}
     *  }
     * ]
     */
    public async getWeaponsInfo(): Promise<Map<string, number>> {
        const inventory = await this.getInventory()

        const weapons = new Map<string, number>()

        for (const type of ['EMP_BURSTER', 'ULTRA_STRIKE']) {
            for (let i = 1; i < 9; i++) {
                weapons.set(`${type}-${i}`, 0)
            }
        }

        weapons.set('ADA-0', 0)
        weapons.set('JARVIS-0', 0)

        for (const weapon of inventory.weapons) {
            const key = `${weapon.type}-${weapon.level}`
            if (weapons.has(key)) {
                weapons.set(key, weapons.get(key)! + 1)
            } else {
                // Key should have been set before
                console.warn('missing key', key)
                weapons.set(key, 1)
            }
        }

        return weapons
    }

    /**
     * @return
     * [
     *  {
     *     RESONATOR-{LEVEL}: {COUNT}
     *  }
     * ]
     */
    public async getResonatorsInfo(): Promise<Map<string, number>> {
        const inventory = await this.getInventory()
        const resonatorsInfo = new Map<string, number>()

        for (const resonator of inventory.resonators) {
            const key = `RESONATOR-${resonator.level}`
            if (resonatorsInfo.has(key)) {
                resonatorsInfo.set(key, resonatorsInfo.get(key)! + 1)
            } else {
                resonatorsInfo.set(key, 1)
            }
        }

        for (const [k, v] of [...resonatorsInfo.entries()].toSorted(
            ([a], [b]) => {
                const numA = parseInt((/\d+$/.exec(a))?.[0] ?? '0', 10)
                const numB = parseInt((/\d+$/.exec(b))?.[0] ?? '0', 10)
                return numA - numB
            }
        )) {
            resonatorsInfo.delete(k)
            resonatorsInfo.set(k, v)
        }

        return resonatorsInfo
    }


    public async getModsInfo() {
        const inventory = await this.getInventory()
        const info = new Map<string, number>()

        for (const modulator of inventory.mods) {
            const key = `${modulator.type}-${modulator.rarity}`
            if (info.has(key)) {
                info.set(key, info.get(key)! + 1)
            } else {
                info.set(key, 1)
            }
        }

        return info
    }


    public async getBoostsInfo() {
        const inventory = await this.getInventory()
        const info = new Map<string, number>()
        for (const boost of inventory.boosts) {
            const key = boost.type
            if (info.has(key)) {
                info.set(key, info.get(key)! + 1)
            } else {
                info.set(key, 1)
            }
        }

        return info
    }

    public async getCubesInfo() {
        const inventory = await this.getInventory()
        const info = new Map<string, number>()

        for (const cube of inventory.cubes) {
            const key = `POWER_CUBE-${cube.level}`
            if (info.has(key)) {
                info.set(key, info.get(key)! + 1)
            } else {
                info.set(key, 1)
            }
        }

        for (const [k, v] of [...info.entries()].toSorted(
            ([a], [b]) => {
                const numA = parseInt(a.slice(-1))
                const numB = parseInt(b.slice(-1))
                return numA - numB
            }
        )) {
            info.delete(k)
            info.set(k, v)
        }

        return info
    }

    private listKeysInCapsule(items: IngressInventory.ContainerItem[]): Inventory.KeyCapsuleItem[] {
        const keys = []
        for (const capsuleItem of items) {
            const coupler = capsuleItem.exampleGameEntity[2].portalCoupler
            const guid = coupler.portalGuid
            const key: Inventory.Key = {
                guid: guid,
                title: coupler.portalTitle,
                lat:0,
                lng:0,
            }
            const item: Inventory.KeyCapsuleItem = {
                key: key,
                count: capsuleItem.itemGuids.length,
            }

            keys.push(item)
        }
        return keys
    }

    private async fetchInventory(): Promise<IngressInventory.Items[]> {
        const isEnabled = false // todo load data from cache

        let items: IngressInventory.Items[]

        if (isEnabled) {
            const response = await this.postAjax('getInventory', {lastQueryTimestamp: 0})

            items = response.result

        } else {
            // todo REMOVE TEST DATA
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const json = require('../testfiles/example1.json')

            items = json.result
        }

        return items
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

    /**
     * by EisFrei ?
     */
    private convertHexToSignedFloat(num: string) {
        let int = parseInt(num, 16)
        if ((int & 0x80000000) === -0x80000000) {
            int = -1 * (int ^ 0xFFFFFFFF) + 1
        }
        return int / 10e5
    }
}