import * as Handlebars from 'handlebars'
import {HelperOptions} from 'handlebars'

// @ts-expect-error "Import attributes are only supported when the --module option is set to esnext, nodenext, or preserve"
import dialogTemplate from './templates/dialog.hbs' with {type: 'text'}

// @ts-expect-error "Import attributes are only supported when the --module option is set to esnext, nodenext, or preserve"
import itemsContainerTemplate from './templates/_items-container.hbs' with {type: 'text'}
// @ts-expect-error "Import attributes are only supported when the --module option is set to esnext, nodenext, or preserve"
import items1ContainerTemplate from './templates/_items1-container.hbs' with {type: 'text'}

import {translateKey} from '../types/key-translations'
import {InventoryHelper} from './InventoryHelper'

Handlebars.registerHelper({
    eachInMap: (map: Map<any, any>, block: HelperOptions) => {
        let out = ''
        if (map && map instanceof Map) {
            for (const [key, value] of map) {
                out += block.fn({key, value})
            }
        }
        return out
    },
    translateKey: (key: string) => {
        return translateKey(key)
    }
})

export class DialogHelper {

    private inventoryHelper: InventoryHelper

    public constructor(
        private pluginName: string,
        private title: string,
    ) {
        this.inventoryHelper = new InventoryHelper()
    }

    public getDialog(): JQuery {
        const template: HandlebarsTemplateDelegate = Handlebars.compile(dialogTemplate)

        const data = {
            plugin: 'window.plugin.' + this.pluginName,
            prefix: this.pluginName,
        }

        return window.dialog({
            id: this.pluginName,
            title: this.title,
            html: template(data),
            width: 800,
            height: 600,
        }).parent()
    }

    public showPanel(name: string) {
        for (const panel of ['Inventory', 'Keys', 'Other']) {
            const element = document.getElementById(`${this.pluginName}-${panel}-Panel`)
            if (element) element.style.display = 'none'
        }

        const element = document.getElementById(`${this.pluginName}-${name}-Panel`)
        if (element) element.style.display = 'block'
    }

    public async updateDialog() {
        console.log(await this.inventoryHelper.getInventory())

        const resonators = await this.inventoryHelper.getResonatorsInfo()
        const weapons = await this.inventoryHelper.getWeaponsInfo()
        const modulators = await this.inventoryHelper.getModsInfo()

        const cubes = await this.inventoryHelper.getCubesInfo()
        const boosts = await this.inventoryHelper.getBoostsInfo()

        let total = 0, cntEquipment = 0, cntKeys = 0, cntOther = 0

        cntEquipment += this.processResos(resonators)
        cntEquipment += this.processWeapons(weapons)
        cntEquipment += this.processModulators(modulators)

        cntKeys += 0

        cntOther += this.processCubes(cubes)
        cntOther += this.processBoosts(boosts)

        total = cntEquipment + cntKeys + cntOther

        this.UpdateCountField('cntEquipment', cntEquipment)
        this.UpdateCountField('cntKeys', cntKeys)
        this.UpdateCountField('cntOther', cntOther)

        this.UpdateCountField('cntTotal', total)
    }

    private processResos(resonators: Map<string, number>) {
        const itemsTemplate: HandlebarsTemplateDelegate = Handlebars.compile(itemsContainerTemplate)
        let cntResos = 0

        const resosContainer = document.getElementById(this.pluginName + '-Resonators-Container') as Element
        resosContainer.innerHTML = itemsTemplate({items: resonators})

        for (const count of resonators.values()) {
            cntResos += count
        }

        this.UpdateCountField('cntResonators', cntResos)

        return cntResos
    }

    private processWeapons(weapons: Map<string, number>) {
        const itemsTemplate: HandlebarsTemplateDelegate = Handlebars.compile(itemsContainerTemplate)

        const burstersContainer = document.getElementById(this.pluginName + '-Bursters-Container') as Element
        const strikesContainer = document.getElementById(this.pluginName + '-Strikes-Container') as Element
        const bursters = new Map<string, number>
        const strikes = new Map<string, number>

        let cntBursters = 0, cntStrikes = 0, cntFlips = 0

        for (const [key, value] of weapons) {
            if (key.startsWith('EMP_BURSTER')) {
                bursters.set(key, value)
                cntBursters += value
            } else if (key.startsWith('ULTRA_STRIKE')) {
                strikes.set(key, value)
                cntStrikes += value
            } else if (['ADA-0', 'JARVIS-0'].includes(key)) {
                // Viruses also go here
                strikes.set(key, value)
                cntFlips += value
            } else {
                console.warn('Unknown weapon', key)
            }
        }

        const total = cntBursters + cntStrikes + cntFlips

        burstersContainer.innerHTML = itemsTemplate({items: bursters})
        strikesContainer.innerHTML = itemsTemplate({items: strikes})

        this.UpdateCountField('cntBursters', cntBursters)
        this.UpdateCountField('cntStrikes', cntStrikes)
        this.UpdateCountField('cntFlips', cntFlips)

        this.UpdateCountField('cntWeapons', total)

        return total
    }

    private processModulators(modulators: Map<string, number>) {
        const itemsTemplate: HandlebarsTemplateDelegate = Handlebars.compile(itemsContainerTemplate)

        const shieldsContainer = document.getElementById(this.pluginName + '-Shields-Container') as Element,
            hackModsContainer = document.getElementById(this.pluginName + '-HackMods-Container') as Element,
            otherModsContainer = document.getElementById(this.pluginName + '-OtherMods-Container') as Element,
            shields = new Map<string, number>,
            hackMods = new Map<string, number>,
            otherMods = new Map<string, number>,
            otherModsTypes = [
                'FORCE_AMP-RARE', 'TURRET-RARE',
                'LINK_AMPLIFIER-RARE', 'ULTRA_LINK_AMP-VERY_RARE',
                'TRANSMUTER_ATTACK-VERY_RARE', 'TRANSMUTER_DEFENSE-VERY_RARE' // ITOs
            ],
            rarities = ['COMMON', 'RARE', 'VERY_RARE']

        let cntShields = 0, cntHack = 0, cntOther = 0

        for (const [key, value] of modulators) {
            if (key.startsWith('RES_SHIELD')
                || key.startsWith('EXTRA_SHIELD')
            ) {
                shields.set(key, value)
                cntShields += value
            } else if (key.startsWith('HEATSINK')
                || key.startsWith('MULTIHACK')
            ) {
                hackMods.set(key, value)
                cntHack += value
            } else if (otherModsTypes.includes(key)) {
                otherMods.set(key, value)
                cntOther += value
            } else {
                console.warn(`Unknown modulator: ${key}`)
                otherMods.set(key, value)
                cntOther += value
            }
        }

        shieldsContainer.innerHTML = itemsTemplate({
            items: this.sortMapByCompoundKey(shields, ['RES_SHIELD', 'EXTRA_SHIELD'], rarities)
        })
        hackModsContainer.innerHTML = itemsTemplate({
            items: this.sortMapByCompoundKey(hackMods, ['HEATSINK', 'MULTIHACK'], rarities)
        })
        otherModsContainer.innerHTML = itemsTemplate({
            items: this.sortMapByKey(otherMods, otherModsTypes)
        })

        const total = cntShields + cntHack + cntOther

        this.UpdateCountField('cntModShields', cntShields)
        this.UpdateCountField('cntModHack', cntHack)
        this.UpdateCountField('cntModOther', cntOther)

        this.UpdateCountField('cntMods', total)

        return total
    }

    private processBoosts(boosts: Map<string, number>) {
        const itemsTemplate: HandlebarsTemplateDelegate = Handlebars.compile(items1ContainerTemplate)//todo TEST

        const boostsPlayContainer = document.getElementById(this.pluginName + '-Boosts-Play-Container') as Element,
            boostsBeaconsContainer = document.getElementById(this.pluginName + '-Boosts-Beacons-Container') as Element,
            play = new Map<string, number>,
            beacons = new Map<string, number>,
            playTypes = ['FRACK', 'APEX', 'BB_BATTLE', 'FW_ENL', 'FW_RES'],
            beaconsTypes = new Set(['MEET', 'TOASTY', 'NIA', 'BN_PEACE', 'BN_BLM', 'RES', 'ENL'])

        let total = 0, cntPlay = 0, cntBeacons = 0

        for (const [key, value] of boosts) {
            if (playTypes.includes(key)) {
                play.set(key, value)
                cntPlay += value
            } else if (beaconsTypes.has(key)) {
                beacons.set(key, value)
                cntBeacons += value
            } else {
                console.warn(`Unknown boost: ${key}`)
            }
        }

        total += cntPlay + cntBeacons
        boostsPlayContainer.innerHTML = itemsTemplate({items: this.sortMapByKey(play, playTypes)})
        boostsBeaconsContainer.innerHTML = itemsTemplate({items: beacons})

        this.UpdateCountField('cntBoostsPlay', cntPlay)
        this.UpdateCountField('cntBoostsBeacons', cntBeacons)

        this.UpdateCountField('cntBoosts', total)

        return total
    }


    private processCubes(cubes: Map<string, number>) {
        const itemsTemplate: HandlebarsTemplateDelegate = Handlebars.compile(items1ContainerTemplate)//todo TEST

        const cubesContainer = document.getElementById(this.pluginName + '-Cubes-Container') as Element
        cubesContainer.innerHTML = itemsTemplate({items: cubes})

        let count = 0

        for (const cnt of cubes.values()) {
            count += cnt
        }

        this.UpdateCountField('cntCubes', count)

        return count
    }


    private UpdateCountField(name: string, count: number) {
        const element = document.getElementById(this.pluginName + '-' + name) as Element

        if (element) {
            element.innerHTML = count.toString()
        } else {
            console.warn(`Unknown countField: ${name}`)
        }
    }

    private sortMapByKey<T>(
        map: Map<string, T>,
        order: string[]
    ): Map<string, any> {
        return new Map(
            [...map.entries()].toSorted(
                ([a], [b]) => order.indexOf(a) - order.indexOf(b)
            )
        )
    }

    private sortMapByCompoundKey<T>(
        map: Map<string, T>,
        orderPart1: string[],
        orderPart2: string[]
    ): Map<string, any> {
        return new Map(
            [...map.entries()].toSorted(
                ([keyA], [keyB]) => {
                    const [partA1, partA2] = keyA.split('-')
                    const [partB1, partB2] = keyB.split('-')

                    const order1Diff = orderPart1.indexOf(partA1) - orderPart1.indexOf(partB1)
                    if (order1Diff !== 0) {

                        return order1Diff
                    }

                    return orderPart2.indexOf(partA2) - orderPart2.indexOf(partB2)
                }
            )
        )
    }
}