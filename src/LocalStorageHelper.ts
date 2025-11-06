export class LocalStorageHelper {
    constructor(private storage_key: string) {}

    public saveMap<T, U>(key: string, map: Map<T, U>): void {
        const object = Object.fromEntries(map)
        localStorage.setItem(this.storage_key + '-' + key, JSON.stringify(object))
    }

    public loadMap<T extends string, U>(key: string): Map<T, U> | undefined {
        const json = localStorage.getItem(this.storage_key + '-' + key)
        if (!json) return undefined

        const object = JSON.parse(json) as Record<T, U>
        const entries = Object.entries(object) as [T, U][]

        return new Map<T, U>(entries)
    }
}