import { AttackDirT, ZoneIdT } from "common/types/game-data";
import { createContext } from "react";

export type BoardContextT = {
    handleActivate: (zone: ZoneIdT) => void
    handleAttack: (attacking: AttackDirT | undefined, zone: ZoneIdT) => void
} 

let defaultContext = {
    handleActivate: (zone: ZoneIdT) => {},
    handleAttack: (attacking: AttackDirT | undefined, zone: ZoneIdT) => {}
} as BoardContextT

export const BoardContext = createContext(defaultContext);