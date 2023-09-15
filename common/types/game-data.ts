export type BaseCardT = {
    name: string
    cost: string
    type: string
    subtype?: string
    description: string
    value: string
}

export type UnitCardT = BaseCardT & {
    attack: string
    health: string
    move: string
}

export type StratagemCardT = BaseCardT

export type AnyCardT = UnitCardT | StratagemCardT

// Used to represent a card on the board
export type CardInstanceT = {
    instanceId: string
    card: AnyCardT
    owner: number
    zone: ZoneIdT
}

export type BoardStackInstanceT = null | {
    instances: Array<CardInstanceT>
    attacking?: AttackDirT
    activated: boolean
    annotation?: string
}

export type AttackDirT = 'N'|'S'|'E'|'W'

export type ZoneNameT = 'Board' | 'Hand' | 'Stack' | 'Deck' | 'Damage' | 'Exile' | 'Graveyard'

export enum PhaseName {
    Refresh, Draw, Movements, Attacks, Defenders, Damage, Deployment, End
}

// colId is null for zones that are 1 dimmensional (anything but board)
// index is null for zones that aren't stacks (anything but board)
// playerId is null for zone that aren't owned by a player (stack and board)
export type ZoneIdT = {
    zoneName: ZoneNameT
    rowId: number
    colId?: number
    index?: number
    playerId?: number
}

export type CardInstanceDataNT = CardInstanceT | null

export type PlayerData = {
    deck: Array<CardInstanceT>
    graveyard: Array<CardInstanceT>
    damage: Array<CardInstanceT>
    exile: Array<CardInstanceT>
    hand: Array<CardInstanceT>
}