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
}

export type BoardStackInstanceT = null | {
    instances: Array<CardInstanceT>
    attacking: 'N'|'S'|'E'|'W'|null
    activated: boolean|
}

export type CardInstanceDataNT = CardInstanceT | null

export type PlayerData = {
    deck: Array<AnyCardT>
    graveyard: Array<AnyCardT>
    damage: Array<AnyCardT>
    exile: Array<AnyCardT>
    hand: Array<AnyCardT>
}