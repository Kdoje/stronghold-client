export type BaseCardT = {
    name: string
    cost: string
    type: string
    subtype: string
    description: string
    value: string
}

export type UnitCardT = BaseCardT & {
    attack: string
    health: string
    move: string
}

export type StratagemCardT = BaseCardT

export type CardInfoT = UnitCardT | StratagemCardT