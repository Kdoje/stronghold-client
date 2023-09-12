import { AttackDirT, CardInstanceT, ZoneIdT } from "common/types/game-data";
import { createContext } from "react";

export type BoardContextT = {
    handleActivate: (zone: ZoneIdT) => void
    handleAttack: (attacking: AttackDirT | undefined, zone: ZoneIdT) => void
    setAnnotation: (zone: ZoneIdT, annotation: string|undefined) => void
    getPlayerId: () => number
    updateFoundryData: (zone: ZoneIdT, owner: number) => void
    setFocusedCard: (card: CardInstanceT) => void
    getActiveCard: () => CardInstanceT | undefined
} 

let defaultContext = {
    handleActivate: (zone: ZoneIdT) => {},
    handleAttack: (attacking: AttackDirT | undefined, zone: ZoneIdT) => {},
    setAnnotation: (zone: ZoneIdT, annotation: string|undefined) => {},
    getPlayerId: () => 0,
    updateFoundryData: (zone: ZoneIdT, owner: number) => {},
    setFocusedCard: (card: CardInstanceT) => {},
    getActiveCard: () => {}
} as BoardContextT

export const BoardContext = createContext(defaultContext);