import { AnyCardT } from "common/types/game-data";
import { createContext } from "react";

export type DeckEditorContextT = {
    modifyDeckContents: (card: AnyCardT, qtyToAdd: number) => void;
}

let defaultContext = {
    modifyDeckContents: (card: AnyCardT, qtyToAdd: number) => {}
}

export const DeckEditorContext = createContext(defaultContext);