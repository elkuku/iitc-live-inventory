
export function translateKey(key: string): string {
    return translations.get(key) ?? key
}
const translations = new Map<string, string>()

for (let i = 1; i < 9; i++) {
    translations
        .set('RESONATOR-'+i, 'Resonator level '+i)
        .set('EMP_BURSTER-'+i, 'Burster level '+i)
        .set('ULTRA_STRIKE-'+i, 'Ultra Strike level '+i)

}

translations
    .set('ADA-0', 'ADA Refactor')
    .set('JARVIS-0', 'JARVIS Virus')

    .set('FRACK', 'Fracker')
    .set('BB_BATTLE', 'Battle Beacon')
    .set('FW_ENL', 'Fireworks Enlightened')
    .set('FW_RES', 'Fireworks Resistance')
