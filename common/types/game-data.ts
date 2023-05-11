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
export type AnyCardDataT = {
    card: AnyCardT
    annotation?: string
    owner: number
}

export type PlayerData = {
    deck: Array<AnyCardT>
    graveyard: Array<AnyCardT>
    damage: Array<AnyCardT>
    exile: Array<AnyCardT>
    hand: Array<AnyCardT>
}