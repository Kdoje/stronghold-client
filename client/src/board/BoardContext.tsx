import { AttackDirT, ZoneIdT } from "common/types/game-data";
import { createContext } from "react";

export type BoardContextT = {
    handleActivate: (zone: ZoneIdT) => void
    handleAttack: (attacking: AttackDirT | undefined, zone: ZoneIdT) => void
    setAnnotation: (zone: ZoneIdT, annotation: string|undefined) => void
} 

let defaultContext = {
    handleActivate: (zone: ZoneIdT) => {},
    handleAttack: (attacking: AttackDirT | undefined, zone: ZoneIdT) => {},
    setAnnotation: (zone: ZoneIdT, annotation: string|undefined) => {}
} as BoardContextT

export const BoardContext = createContext(defaultContext);