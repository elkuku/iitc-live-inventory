import * as Handlebars from 'handlebars'
import {HelperOptions} from 'handlebars'

// @ts-expect-error "Import attributes are only supported when the --module option is set to esnext, nodenext, or preserve"
import dialogTemplate from './templates/dialog.hbs' with {type: 'text'}

// @ts-expect-error "Import attributes are only supported when the --module option is set to esnext, nodenext, or preserve"
import itemsContainerTemplate from './templates/_items-container.hbs' with {type: 'text'}
// @ts-expect-error "Import attributes are only supported when the --module option is set to esnext, nodenext, or preserve"
import items1ContainerTemplate from './templates/_items1-container.hbs' with {type: 'text'}

Handlebars.registerHelper('eachInMap', (map: Map<any, any>, block: HelperOptions) => {
    let out = ''
    if (map && map instanceof Map) {
        for (const [key, value] of map) {
            out += block.fn({key, value})
        }
    }
    return out
})

export class DialogHelper {
    public constructor(
        private pluginName: string,
        private title: string,
    ) {}

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

    updateDialog(resonators: Map<string, number>, weapons: Map<string, number>, modulators: Map<string, number>, boosts: Map<string, number>) {
        const itemsTemplate: HandlebarsTemplateDelegate = Handlebars.compile(itemsContainerTemplate)
        const items1Template: HandlebarsTemplateDelegate = Handlebars.compile(items1ContainerTemplate)

        // Resos
        const resosContainer = document.getElementById(this.pluginName + '-Resonators-Container') as Element
        resosContainer.innerHTML = itemsTemplate({items: resonators})

        // Weapons
        const burstersContainer = document.getElementById(this.pluginName + '-Bursters-Container') as Element
        const strikesContainer = document.getElementById(this.pluginName + '-Strikes-Container') as Element
        const bursters = new Map<string, number>
        const strikes = new Map<string, number>

        for (const [key, value] of weapons) {
            if (key.startsWith('EMP_BURSTER')) {
                bursters.set(key, value)
            } else {
                // Viruses also go here
                strikes.set(key, value)
            }
        }

        burstersContainer.innerHTML = itemsTemplate({items: bursters})
        strikesContainer.innerHTML = itemsTemplate({items: strikes})

        // Mods
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

        for (const [key, value] of modulators) {
            if (key.startsWith('RES_SHIELD')
                || key.startsWith('EXTRA_SHIELD')
            ) {
                shields.set(key, value)
            } else if (key.startsWith('HEATSINK')
                || key.startsWith('MULTIHACK')
            ) {
                hackMods.set(key, value)
            } else if (otherModsTypes.includes(key)) {
                otherMods.set(key, value)
            } else {
                console.warn(`Unknown modulator: ${key}`)
                otherMods.set(key, value)
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

        // Boosts
        const boostsPlayContainer = document.getElementById(this.pluginName + '-Boosts-Play-Container') as Element,
            boostsBeaconsContainer = document.getElementById(this.pluginName + '-Boosts-Beacons-Container') as Element,
            play = new Map<string, number>,
            beacons = new Map<string, number>,
            playTypes = ['FRACK', 'BB_BATTLE', 'FW_ENL', 'FW_RES'],
            beaconsTypes = new Set(['MEET',])

        for (const [key, value] of boosts) {
            if (playTypes.includes(key)) {
                play.set(key, value)
            } else if (beaconsTypes.has(key)) {
                beacons.set(key, value)
            } else {
                console.warn(`Unknown boost: ${key}`)
            }
        }

        boostsPlayContainer.innerHTML = items1Template({items: this.sortMapByKey(play, playTypes)})
        boostsBeaconsContainer.innerHTML = items1Template({items: beacons})
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

    private sortMapByKey<T>(map: Map<string, T>, order: string[]): Map<string, any> {
        return new Map(
            [...map.entries()].toSorted(
                ([a], [b]) => order.indexOf(a) - order.indexOf(b)
            )
        )
    }
}