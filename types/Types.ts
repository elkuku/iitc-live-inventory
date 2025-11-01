// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Inventory {
    export interface Items {
        resonators: Resonator[]
        weapons: Weapon[]
        mods: Modulator[]
        keys: Key[]
        cubes: Cube[]
        boosts: Boost[]
        keyCapsules: KeyCapsule[]
    }

    export interface Resonator {
        level: number
    }

    export interface Boost {
        type: string
    }

    export interface Weapon {
        type: string
        level: number
    }

    export interface Modulator {
        type: string
        rarity: IITC.ModRarity
    }

    export interface Key {
        guid: string
        title: string
        lat:number
        lng:number
    }

    export interface Cube {
        level: number
    }

    export interface KeyCapsule {
        differentiator: string
        count: number
        keys: KeyCapsuleItem[]
    }

    export interface KeyCapsuleItem {
        key: Key
        count: number
    }
}

export interface KeyInfo {
    total: number
    atHand?: number
    portal: Portal
    capsules?: Map<string, number>
}

interface Portal {
    guid: string
    title: string
    lat: number
    lng: number
}
