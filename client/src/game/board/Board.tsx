import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { AttackDirT, BoardStackInstanceT, CardInstanceT, PlayerData, ZoneIdT, UnitCardT, AnyCardT, PhaseName, isZoneHidden } from "common/types/game-data";
import { PLAYER_CONNECTED } from "common/MessageTypes";
import { StratagemCard } from "./cards/StratagemCard";
import { UnitCard } from "./cards/UnitCard";
import { useCallback, useEffect, useRef, useState } from "react";
import css from './Board.module.css';
import PreviewZone, { PREVIEW_ID_POSTFIX } from "./cards/preview/PreviewZone";
import { BoardContext } from "./BoardContext";
import CardInstance from "./cards/CardInstance";
import { Socket } from "socket.io-client";
import DeckOptionsContainer from "./DeckOptionsContainer";
import PlayerDataDisplay from "./PlayerDataDisplay";
import FacedownCardInstance from "./cards/FacedownCardInstance";
import PhaseSelector from "./PhaseSelector";
import BattlefieldGrid from "./BattlefieldGrid";

export default function Board(props: { socket: Socket }) {
    let connected = false;
    const [playerId, setPlayerId] = useState(0);
    function getPlayerColor() {
        return playerId === 0 ? 'Red' : 'Green'
    }
    const [curIndex, setCurIndex] = useState(0);
    const [playerData, setPlayerData] = useState<PlayerData[]>([
        {
            deck: [{
                zone: { zoneName: "Deck", rowId: 0 }, instanceId: '4', owner: 0,
                card: {
                    name: "Deck card 1", description: "stands alone", cost: "1 V",
                    type: "Tactic", value: "V"
                }
            }],
            graveyard: [],
            damage: [],
            exile: [], hand: [
                {
                    zone: { zoneName: "Hand", rowId: 0 }, instanceId: '1', owner: 0,
                    card: { name: "Eat Some Food", description: "stands alone", cost: "1 V", type: "Tactic", value: "V" }
                },
                {
                    zone: { zoneName: "Hand", rowId: 1 }, instanceId: '2', owner: 0,
                    card: { name: "Sheoldred, The Apocolypse", description: "Breaks standard", cost: "5", type: "Unit", subtype: "Insectoid Horror", value: "A", attack: "4", health: "5", move: "1" }
                }]
        },
        { deck: [], graveyard: [], damage: [], exile: [], hand: [] }
    ]);

    const [curPhase, setCurPhase] = useState<PhaseName>("Refresh" as unknown as PhaseName);
    const [logData, setLogData] = useState<string[]>([]);

    function setAndPostPlayerData(data: PlayerData[]) {
        props.socket.emit("playerData", { playerId: playerId, playerData: data })
        setPlayerData(data);
    }

    const [stackData, setStackData] = useState<CardInstanceT[]>([]);
    function setAndPostStackData(data: CardInstanceT[]) {
        props.socket.emit("stackData", { playerId: playerId, stackData: data })
        setStackData(data);
    }

    const [foundryData, setFoundryData] = useState<number[][]>(Array(6).fill(Array(5).fill(-1)));
    function setAndPostFoundryData(data: number[][]) {
        props.socket.emit("foundryData", { playerId: playerId, foundryData: data })
        setFoundryData(data);
    }

    const [boardData, setBoardData] = useState<BoardStackInstanceT[][]>(Array(6).fill(Array(5).fill(null)));
    function setAndPostBoardData(data: BoardStackInstanceT[][]) {
        props.socket.emit("boardData", { playerId: playerId, boardData: data })
        setBoardData(data);
    }

    const logEndRef = useRef<HTMLDivElement>(null);
    const logWindowRef = useRef<HTMLDivElement>(null);

    function setAndPostCurPhase(data: PhaseName) {
        let logMessage = `Player ${getPlayerColor()}: Set Phase to ${PhaseName[PhaseName[data]]}`;
        if (data.toString() === PhaseName[PhaseName.End]) {
            logMessage = '------' + logMessage + '--------';
        }
        appendAndPostLogData(logMessage);
        
        props.socket.emit("phaseData", { playerId: playerId, curPhase: data })
        setCurPhase(data);
    }

    function appendAndPostLogData(data: string) {
        let newLogData = appendLogData(data);
        props.socket.emit("logData", {playerId: playerId, logData: newLogData})
    }

    function appendLogData(data: string) {
        let newLogData = [...logData];
        newLogData.push(data);
        setLogData(newLogData);
        return newLogData
    }

    const [activeZone, setActiveZone] = useState<ZoneIdT>({
        zoneName: "Board",
        rowId: 0,
        colId: 0
    });

    const [focusedCard, setFocusedCard] = useState<CardInstanceT | undefined>(undefined);
    const [activeCard, setActiveCard] = useState<CardInstanceT | undefined>(undefined);


    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 1,
            },
        })
    )

    props.socket.onAny((event, ...args) => {
        if (event === "playerId") {
            setPlayerId(args[0]);
        }
        if (event === "boardData") {
            setBoardData(args[0].boardData);
        } else if (event == "playerData") {
            setPlayerData(args[0].playerData);
        } else if (event == "stackData") {
            setStackData(args[0].stackData);
        } else if (event == "foundryData") {
            setFoundryData(args[0].foundryData);
        } else if (event === "phaseData") {
            setCurPhase(args[0].curPhase);
        } else if (event === "logData") {
            setLogData(args[0].logData)
        }
    })

    useEffect(() => {
        console.log(logWindowRef.current)
        if (logData.length > 0 && (logWindowRef.current!.scrollHeight - logWindowRef.current!.scrollTop - logWindowRef.current!.clientHeight) < 50) {
            logEndRef.current!.scrollIntoView({
                behavior: "smooth",
                block: "end"
            })
        }
    }, [logData.length])

    useEffect(() => {
        if (!connected) {
            props.socket.emit(PLAYER_CONNECTED, [])
            connected = true;
        }
        setAndPostBoardData(boardData);
        setAndPostPlayerData(playerData);
        setAndPostStackData(stackData);
        setAndPostFoundryData(foundryData);
        setAndPostCurPhase(curPhase);
    }, [])

    function addCardToHand() {
        let id = (Math.random() + 1).toString(4)
        let newData = playerData.slice();
        let rowId = playerData[playerId].hand.length;
        newData[playerId].hand.push({
            zone: { zoneName: "Hand", rowId: rowId }, instanceId: id, owner: playerId,
            card: { name: `${rowId}: Sheoldred, The Apocolypse`, description: "Breaks standard", cost: "5", type: "Unit", subtype: "Insectoid Horror", value: "A", attack: "4", health: "5", move: "1" }
        })
        setAndPostPlayerData(newData);
    }

    function addCardToBoard() {
        let newBoardData = boardData.map((item) => item.slice());
        let id = (Math.random() + 1).toString(4)
        let row = Math.floor(curIndex / 5)
        let col = curIndex % 5
        newBoardData[row][col] = {
            instances: [{
                zone: {
                    zoneName: "Board",
                    rowId: row,
                    colId: col
                },
                instanceId: id,
                owner: playerId,
                card: {
                    name: `${curIndex} Sheoldred, The Apocolypse`, description: "Breaks standard",
                    cost: "5", type: "Unit", subtype: "Insectoid Horror", value: " ",
                    attack: "4", health: "5|3", move: "1"
                }
            }],
            activated: false
        };
        setCurIndex(curVal => curVal += 1);
        setAndPostBoardData(newBoardData);
    }

    function clearPlayerData() {
        let newBoardData = boardData.map((item) => item.slice());
        let newPlayerData = playerData.slice();
        for (let rIndex = 0; rIndex < newBoardData.length; rIndex++) {
            for (let cIndex = 0; cIndex < newBoardData[rIndex].length; cIndex++) {
                for (let i = (newBoardData[rIndex][cIndex]?.instances.length ?? 0) - 1; i >= 0; i--) {
                    if (newBoardData[rIndex][cIndex]?.instances[i].owner === playerId) {
                        newBoardData[rIndex][cIndex]?.instances.splice(i, 1);
                        if (newBoardData[rIndex][cIndex]?.annotation !== undefined) {
                            newBoardData[rIndex][cIndex]!.annotation = undefined;
                        }
                        if (newBoardData[rIndex][cIndex]?.activated !== undefined) {
                            newBoardData[rIndex][cIndex]!.activated = false;
                        }
                        if (newBoardData[rIndex][cIndex]?.attacking !== undefined) {
                            newBoardData[rIndex][cIndex]!.attacking = undefined;
                        }
                    }
                }
            }
        }

        let newFoundryData = foundryData.map((item) => item.slice());
        for (let rIndex = 0; rIndex < newFoundryData.length; rIndex++) {
            for (let cIndex = 0; cIndex < newFoundryData[rIndex].length; cIndex++) {
                if (newFoundryData[rIndex][cIndex] === playerId) {
                    newFoundryData[rIndex][cIndex] = -1;
                }
            }
        }

        let newStackData = stackData.slice();
        for (let i = 0; i < newStackData.length; i++) {
            if (newStackData[i].owner === playerId) {
                newStackData.splice(i, 1);
            }
        }

        newPlayerData[playerId].graveyard = [];
        newPlayerData[playerId].damage = [];
        newPlayerData[playerId].exile = [];
        newPlayerData[playerId].hand = [];
        newPlayerData[playerId].deck = [];

        // TODO this needs to rezone the board data to avoid bugs, but these
        // are non-game breaking so low priority
        setAndPostBoardData(newBoardData);
        setAndPostPlayerData(newPlayerData);
        setAndPostStackData(newStackData);
        setAndPostFoundryData(newFoundryData);
        setAndPostCurPhase("Refresh" as unknown as PhaseName);
    }

    function setPlayerDeckData(cards: Array<AnyCardT>, wielder?: AnyCardT) {
        clearPlayerData();
        let newData = playerData.slice();
        shuffle(cards, newData);

        let id = (Math.random() + 1).toString(4);
        if (wielder) {
            newData[playerId].hand.push({
                zone: { zoneName: "Hand", rowId: 0 }, instanceId: id, owner: playerId,
                card: { ...wielder }
            })
        }
        setAndPostPlayerData(newData);
    }

    function shuffle(cards: AnyCardT[], newData: PlayerData[]) {
        let m = cards.length;
        while (m) {
            const i = Math.floor(Math.random() * m--);
            [cards[m], cards[i]] = [cards[i], cards[m]];
        }
        newData[playerId].deck = [];
        cards.forEach((val, index) => {
            let id = (Math.random() + 1).toString(4);
            newData[playerId].deck.push({
                zone: { zoneName: "Deck", rowId: index }, instanceId: id, owner: playerId,
                card: { ...val }
            });
        });
    }

    function handleShuffle() {
        let newData = playerData.slice();
        shuffle(newData[playerId].deck.map((inst) => { return inst.card }), newData);
        setAndPostPlayerData(newData);
    }

    function handleTakeDamage(amount: number) {
        if (amount > 0) {
            let newData = playerData.slice();
            let deckLength = newData[playerId].deck.length
            // damage is twice the amount off the bottom
            amount = Math.min(deckLength, amount * 2);
            let damageCards = newData[playerId].deck.splice(deckLength - amount, amount);
            newData[playerId].damage.unshift(...damageCards);
            rezonePlayerData(newData);
            let logMessage = `Player ${getPlayerColor()}: Took ${amount / 2} damage.`;
            appendAndPostLogData(logMessage);
            setAndPostPlayerData(newData);
        }
    }

    function getOpId() {
        return (playerId + 1) % 2;
    }

    /**
     * 
     * @param newBoardData the board data after the source zone data has been moved
     * @returns the data specified by the source zone
     */
    function handleBoardSourceData(srcZone: ZoneIdT, curBoardData: BoardStackInstanceT[][], newBoardData: BoardStackInstanceT[][]): CardInstanceT[] {
        let sourceZoneData: CardInstanceT[] = []
        let srcZoneLoc = [srcZone.rowId, srcZone.colId ??= -1, srcZone.index ??= -1] // -1 means index is null
        if (srcZoneLoc[2] >= 0) {
            let elt = curBoardData[srcZoneLoc[0]][srcZoneLoc[1]]!.instances[srcZoneLoc[2]]
            sourceZoneData.push(elt);
            newBoardData[srcZoneLoc[0]][srcZoneLoc[1]]!.instances.splice(srcZoneLoc[2], 1)
        } else {
            sourceZoneData = curBoardData[srcZoneLoc[0]][srcZoneLoc[1]]!.instances
            newBoardData[srcZoneLoc[0]][srcZoneLoc[1]] = null;
        }
        return sourceZoneData;
    }


    function handleBoardDestData(srcZone: ZoneIdT, destZone: ZoneIdT, sourceZoneData: CardInstanceT[],
        curBoardData: BoardStackInstanceT[][], newBoardData: BoardStackInstanceT[][]) {
        let destZoneLoc = [destZone.rowId, destZone.colId ??= -1, destZone.index ??= -1] // -1 means index is null

        let destZoneData = curBoardData[destZoneLoc[0]][destZoneLoc[1]]
        let activated = false;
        let annotation = undefined;

        if (srcZone.zoneName === 'Board') {
            activated = curBoardData[srcZone.rowId][srcZone.colId!]!.activated
            if (srcZone.colId !== undefined && srcZone.index === -1) { // if this comes from the board stack, preserve the annotation
                annotation = curBoardData[srcZone.rowId][srcZone.colId!]?.annotation
            }
        }

        if (destZoneLoc[2] >= 0) {
            if (destZoneData?.instances) {
                destZoneData!.instances.splice(destZoneLoc[2], 0, ...sourceZoneData);
            } else {
                destZoneData = { instances: sourceZoneData, activated: activated, annotation: annotation }
            }
        } else {
            if (destZoneData) {
                destZoneData.instances.unshift(...sourceZoneData)
            } else {
                destZoneData = { instances: sourceZoneData, activated: activated, annotation: annotation }
            }
        }

        newBoardData[destZoneLoc[0]][destZoneLoc[1]] = destZoneData;
    }

    /**
    * @param newPlayerData the player data after the source zone data has been moved
    * @returns the data specified by the source zone
    */
    function handleHandSourceData(srcZone: ZoneIdT, curPlayerData: PlayerData[], newPlayerData: PlayerData[]): CardInstanceT[] {
        let sourceZoneData: CardInstanceT[] = []
        let elt = curPlayerData[playerId].hand[srcZone.rowId];
        sourceZoneData.push(elt);
        newPlayerData[playerId].hand.splice(srcZone.rowId, 1)
        rezonePlayerData(newPlayerData);
        return sourceZoneData;
    }

    function handleHandDestData(destZone: ZoneIdT, sourceZoneData: CardInstanceT[], curPlayerData: PlayerData[], newPlayerData: PlayerData[]) {
        newPlayerData[playerId].hand.splice(destZone.rowId, 0, ...sourceZoneData);
        rezonePlayerData(newPlayerData);
    }

    /**
    * @param newStackData the stack data after the source zone data has been moved
    * @returns the data specified by the source zone
    */
    function handleStackSourceData(srcZone: ZoneIdT, curStackData: CardInstanceT[], newStackData: CardInstanceT[]): CardInstanceT[] {
        let sourceZoneData: CardInstanceT[] = []
        let elt = curStackData[srcZone.rowId];
        sourceZoneData.push(elt);
        newStackData.splice(srcZone.rowId, 1)
        rezoneStackData(newStackData);
        return sourceZoneData;
    }

    function handleStackDestData(destZone: ZoneIdT, sourceZoneData: CardInstanceT[], curStackData: CardInstanceT[], newStackData: CardInstanceT[]) {
        newStackData.splice(destZone.rowId, 0, ...sourceZoneData);
        rezoneStackData(newStackData);
    }

    function handlePileSourceData(srcZone: ZoneIdT, curPlayerData: PlayerData[], newPlayerData: PlayerData[]) {
        // TODO this needs to handle re-ordering the cards as well
        let sourceZoneData: CardInstanceT[] = []
        if (srcZone.zoneName === "Deck") {
            sourceZoneData.push(newPlayerData[playerId].deck.splice(srcZone.rowId, 1)[0]);
        } else if (srcZone.zoneName === "Exile") {
            sourceZoneData.push(newPlayerData[playerId].exile.splice(srcZone.rowId, 1)[0]);
        } else if (srcZone.zoneName === "Graveyard") {
            sourceZoneData.push(newPlayerData[playerId].graveyard.splice(srcZone.rowId, 1)[0]);
        } else {
            sourceZoneData.push(newPlayerData[playerId].damage.splice(srcZone.rowId, 1)[0]);
        }
        rezonePlayerData(newPlayerData);
        return sourceZoneData
    }

    function handlePileDestData(destZone: ZoneIdT, sourceZoneData: CardInstanceT[], curPlayerData: PlayerData[], newPlayerData: PlayerData[]) {
        // TODO this needs to handle re-ordering the cards as well
        if (destZone.zoneName === "Deck") {
            newPlayerData[playerId].deck.splice(destZone.rowId, 0, ...sourceZoneData);
        } else if (destZone.zoneName === "Exile") {
            newPlayerData[playerId].exile.splice(destZone.rowId, 0,...sourceZoneData);
        } else if (destZone.zoneName === "Graveyard") {
            newPlayerData[playerId].graveyard.splice(destZone.rowId, 0, ...sourceZoneData);
        } else {
            newPlayerData[playerId].damage.splice(destZone.rowId, 0, ...sourceZoneData);
        }
        rezonePlayerData(newPlayerData);
    }

    function handleAttacking(attacking: AttackDirT | undefined, zone: ZoneIdT) {
        if (zone.colId != null && boardData[zone.rowId][zone.colId] != null && attacking) {
            let newBoardData = boardData.map((item) => item.slice());
            newBoardData[zone.rowId][zone.colId!] = { ...newBoardData[zone.rowId][zone.colId!]!, attacking: attacking, activated: true };
            setAndPostBoardData(newBoardData);
        }
    }

    function handleActivating(zone: ZoneIdT) {
        if (zone.colId != null && boardData[zone.rowId][zone.colId] != null) {
            let newBoardData = boardData.map((item) => item.slice());
            newBoardData[zone.rowId][zone.colId!]!.activated = !boardData[zone.rowId][zone.colId]?.activated
            if (!newBoardData[zone.rowId][zone.colId!]!.activated) {
                newBoardData[zone.rowId][zone.colId!]!.attacking = undefined
            }
            let logMessage = `Player ${getPlayerColor()}: Activated ${newBoardData[zone.rowId][zone.colId!]!.instances[0].card.name} on row: ${zone.rowId + 1} col: ${zone.colId + 1}`;
            appendAndPostLogData(logMessage);
            setAndPostBoardData(newBoardData)
        }
    }

    function setAnnotation(zone: ZoneIdT, annotation: string | undefined) {
        if (zone.colId != null && boardData[zone.rowId][zone.colId] != null) {
            let newBoardData = boardData.map((item) => item.slice());
            newBoardData[zone.rowId][zone.colId!]!.annotation = annotation
            let logMessage = `Player ${getPlayerColor()}: Annotated ${newBoardData[zone.rowId][zone.colId!]!.instances[0].card.name} on row: ${zone.rowId + 1} col: ${zone.colId + 1}`;
            appendAndPostLogData(logMessage);
            setAndPostBoardData(newBoardData)
        }

    }

    function updateFoundryData(zone: ZoneIdT, owner: number) {
        if (zone.zoneName === "Board") {
            let newFoundryData = foundryData.map((item) => item.slice());
            newFoundryData[zone.rowId][zone.colId!] = owner;
            let logMessage = `Player ${getPlayerColor()}: Created a Foundry on row: ${zone.rowId + 1} col: ${zone.colId! + 1}`;
            appendAndPostLogData(logMessage);
            setAndPostFoundryData(newFoundryData);
        }
    }

    function drawCardFromDeck() {
        let newPlayerData = playerData.slice();
        let drawCard = newPlayerData[playerId].deck.splice(0, 1);
        newPlayerData[playerId].hand.push(...drawCard);
        rezonePlayerData(newPlayerData)
        setAndPostPlayerData(newPlayerData);
        let playerColor = playerId === 0 ? 'Red' : 'Green'
        appendAndPostLogData(`Player ${playerColor}: Drew a card from their Deck.`);
    }
    
    function refreshPlayerOccupants() {
        let newBoardData = boardData.map((item) => item.slice());
        for (let row = 0; row < boardData.length; row++) {
            for (let col = 0; col < boardData[row].length; col++) {
                if (newBoardData[row][col]?.instances[0].owner === playerId) {
                    newBoardData[row][col]!.activated = false; 
                    newBoardData[row][col]!.attacking = undefined; 
                }
            }
        }
        let logMessage = `Player ${getPlayerColor()}: Refreshed their Occupants.`;
        appendAndPostLogData(logMessage);
        setAndPostBoardData(newBoardData);
    }

    const handleActivatingCallback = useCallback((zone: ZoneIdT) => {
        handleActivating(zone);
    }, [handleActivating])

    const handleAttackingCallback = useCallback((attacking: AttackDirT | undefined, zone: ZoneIdT) => {
        handleAttacking(attacking, zone)
    }, [handleAttacking])

    const setAnnotationCallback = useCallback((zone: ZoneIdT, annotation: string | undefined) => {
        setAnnotation(zone, annotation);
    }, [setAnnotation])

    const updateFoundryDataCallback = useCallback((zone: ZoneIdT, owner: number) => {
        updateFoundryData(zone, owner);
    }, [updateFoundryData])

    const updateActiveZoneCallback = useCallback((zone: ZoneIdT) => {
        setActiveZone(zone);
    }, [setActiveZone])

    const drawCardFromDeckCallback = useCallback(() => {
        drawCardFromDeck();
    }, [drawCardFromDeck]);

    const refreshPlayerOccupantsCallback = useCallback(() => {
        refreshPlayerOccupants();
    }, [refreshPlayerOccupants]);

    const getPlayerId = useCallback(() => {
        return playerId;
    }, [playerId])

    
    function isCardVisible(focusedCard: CardInstanceT) {
        return ["Deck", "Damage"].indexOf(focusedCard.zone.zoneName) === -1
        || focusedCard.instanceId.toString().includes(PREVIEW_ID_POSTFIX);
    }

    const setFocusedCardCallback = useCallback((card: CardInstanceT, setZone?: boolean) => {
        if (isCardVisible(card)) {
            if (card.zone.zoneName === "Board" && (setZone ?? true)) {
                setActiveZone(card.zone);
            }
            setFocusedCard(card);
        }
    }, [setFocusedCard])

    const getActiveCardCallback = useCallback(() => {
        return activeCard;
    }, [activeCard])

    function handleDragStart(event: DragStartEvent) {
        setFocusedCard(event.active.data.current!.cardInstance)
        setActiveCard(event.active.data.current!.cardInstance)
    }

    function handleDragEnd(event: DragEndEvent) {
        if (focusedCard?.zone && event.over?.data.current?.zone) {
            // we need to check the source zone in order to popluate the source data
            let destZone = event.over.data.current.zone as ZoneIdT
            let srcZone = focusedCard.zone as ZoneIdT
            let srcZoneName = srcZone.zoneName;
            let destZoneName = destZone.zoneName;
            let destZoneLoc = [destZone.rowId, destZone.colId ??= -1, destZone.index ??= -1]
            let srcZoneLoc = [srcZone.rowId, srcZone.colId ??= -1, srcZone.index ??= -1] // -1 means index is null
            let newBoardData = boardData.map((item) => item.slice());
            // TODO build the log statement here
            if (isMoveValid(srcZoneLoc, destZoneLoc, srcZone, destZone)) {
                let sourceZoneData: CardInstanceT[] = []
                let newPlayerData = playerData.slice();
                let newStackData = stackData.slice();

                if (srcZoneName === "Board") {
                    sourceZoneData = handleBoardSourceData(srcZone, boardData, newBoardData);
                    rezoneBoardData(newBoardData, srcZoneLoc);
                } else if (srcZoneName === "Hand") {
                    sourceZoneData = handleHandSourceData(srcZone, playerData, newPlayerData);
                } else if (srcZoneName === "Stack") {
                    sourceZoneData = handleStackSourceData(srcZone, stackData, newStackData);
                } else {
                    sourceZoneData = handlePileSourceData(srcZone, playerData, newPlayerData);
                }

                if (destZoneName === "Board") {
                    handleBoardDestData(srcZone, destZone, sourceZoneData, boardData, newBoardData);
                    rezoneBoardData(newBoardData, destZoneLoc);
                } else if (destZoneName === "Hand") {
                    handleHandDestData(destZone, sourceZoneData, playerData, newPlayerData);
                } else if (destZoneName === "Stack") {
                    handleStackDestData(destZone, sourceZoneData, stackData, newStackData);
                } else {
                    handlePileDestData(destZone, sourceZoneData, playerData, newPlayerData);
                }
                setAndPostBoardData(newBoardData);
                setAndPostPlayerData(newPlayerData);
                setAndPostStackData(newStackData);
                buildAndUpdateLogData(srcZone, destZone, sourceZoneData[0].card.name);
                props.socket.emit("boardData", { playerId: playerId, boardData: newBoardData })
            }
        }
        if (event.over?.data.current?.zone.zoneName === "Board") {
            setActiveZone(event.over.data.current!.zone);
        }
        setActiveCard(undefined);
    }

    function buildAndUpdateLogData(srcZone: ZoneIdT, destZone: ZoneIdT, name: string) {
        let cardName = "a card";
        let fromClause = `${srcZone.zoneName}`;
        let toClause = `${destZone.zoneName}`;
        console.log("zone Name " + destZone.zoneName + " hidden: " + isZoneHidden(destZone.zoneName));
        if (!isZoneHidden(destZone.zoneName)) {
            cardName = name;
        }
        if (srcZone.zoneName === "Board") {
            fromClause = `Board row: ${srcZone.rowId + 1}, col: ${srcZone.colId! + 1}`
        }
        if (destZone.zoneName === "Board") {
            toClause = `Board row: ${destZone.rowId + 1}, col: ${destZone.colId! + 1}`
        }
        let playerColor = playerId === 0 ? 'Red' : 'Green'
        let logMessage = `Player ${playerColor}: Moved ${cardName} from ${fromClause} to ${toClause}`;
        appendAndPostLogData(logMessage);
    }

    function isMoveValid(srcZoneLoc: number[], destZoneLoc: number[], srcZone: ZoneIdT, destZone: ZoneIdT) {
        let srcPlayerId = srcZone.playerId ?? playerId;
        let destPlayerId = destZone.playerId ?? playerId;
        if (!(srcPlayerId === playerId) || !(destPlayerId === playerId)) {
           console.log("move failed", srcZone, destZone)
            return false
        }
        if (srcZone.zoneName === "Board" && destZone.zoneName === "Board") {
            // prevent moving a parent into itself via the preview zone
            return !(srcZone.rowId === destZone.rowId && srcZone.colId === destZone.colId
                && (srcZone.index ?? -1) === -1);
        }
        return srcZoneLoc.toString() !== destZoneLoc.toString() || srcZone.zoneName !== destZone.zoneName;
    }

    function rezoneBoardData(newBoardData: BoardStackInstanceT[][], zoneLoc: number[]) {
        newBoardData[zoneLoc[0]][zoneLoc[1]]?.instances.forEach((instance) => {
            instance.zone = { zoneName: "Board", rowId: zoneLoc[0], colId: zoneLoc[1] }
        });
    }

    function rezonePlayerData(newPlayerData: PlayerData[]) {
        newPlayerData[playerId].hand.forEach((instance, index) => {
            instance.zone = { zoneName: "Hand", rowId: index }
        });
        newPlayerData[playerId].deck.forEach((instance, index) => {
            instance.zone = { zoneName: "Deck", rowId: index }
        });
        newPlayerData[playerId].exile.forEach((instance, index) => {
            instance.zone = { zoneName: "Exile", rowId: index }
        });
        newPlayerData[playerId].graveyard.forEach((instance, index) => {
            instance.zone = { zoneName: "Graveyard", rowId: index }
        });
        newPlayerData[playerId].damage.forEach((instance, index) => {
            instance.zone = { zoneName: "Damage", rowId: index }
        });
    }

    function rezoneStackData(newStackData: CardInstanceT[]) {
        newStackData.forEach((instance, index) => {
            instance.zone = { zoneName: "Stack", rowId: index }
        })
    }

    // Sets the instances for the preview display
    let previewedInstances: Array<CardInstanceT> = boardData[0][0]?.instances ?? []
    if (activeZone.colId !== undefined && activeZone.zoneName === "Board" &&
        boardData[activeZone.rowId][activeZone.colId!]?.instances) {
        previewedInstances = boardData[activeZone.rowId][activeZone.colId!]!.instances
    } else {
        // TODO we should create a method to get the zone data with the zone name
        if (activeZone.zoneName === "Deck") {
            previewedInstances = playerData[activeZone.playerId ?? playerId].deck;
        } else if (activeZone.zoneName === "Damage") {
            previewedInstances = playerData[activeZone.playerId ?? playerId].damage;
        } else if (activeZone.zoneName === "Exile") {
            previewedInstances = playerData[activeZone.playerId ?? playerId].exile;
        } else if (activeZone.zoneName === "Graveyard") {
            previewedInstances = playerData[activeZone.playerId ?? playerId].graveyard;
        }
    }

    // TODO Move this to another component
    let gameLogRender = []
    logData.forEach(log => {
        gameLogRender.push(<p className={css.LogEntry}>{log}</p>)
    })
    gameLogRender.push(<p style={{margin: "0px"}}ref={logEndRef}/>)

    // Sets the individual card preview
    let card;
    if (focusedCard && isCardVisible(focusedCard)) {
        if ((focusedCard.card as UnitCardT).attack) {
            let cardData = focusedCard.card as UnitCardT;
            card = <UnitCard  {...cardData} />;
        } else if (focusedCard) {
            card = <StratagemCard {...focusedCard.card} />;
        }
    }

    return (
        <DndContext
            onDragStart={(event) => { handleDragStart(event) }}
            onDragEnd={(event) => { handleDragEnd(event) }}
            sensors={sensors}
            modifiers={[snapCenterToCursor]}>
            <BoardContext.Provider value={{
                handleActivate: handleActivatingCallback, handleAttack: handleAttackingCallback,
                setAnnotation: setAnnotationCallback, getPlayerId: getPlayerId,
                updateFoundryData: updateFoundryDataCallback,
                setFocusedCard: setFocusedCardCallback,
                getActiveCard: getActiveCardCallback,
                drawCardFromDeck: drawCardFromDeckCallback,
                refreshPlayerOccupants: refreshPlayerOccupantsCallback
            }}>
                <div className={css.gameBoard}>
                    <PlayerDataDisplay playerData={playerData} playerId={playerId}
                        addCardToHand={addCardToHand}
                        addCardToBoard={addCardToBoard}
                        setActiveZone={updateActiveZoneCallback}
                        opId={getOpId()}
                    />
                    <PreviewZone {...{ instances: stackData, zone: { zoneName: "Stack", rowId: 0 }, areaName: "Stack" }} />
                    <BattlefieldGrid boardData={boardData} foundryData={foundryData}/>
                    <PreviewZone {...{ instances: previewedInstances, zone: activeZone, areaName: "CellPreview" }} />
                    <div style={{ gridArea: "PlayerHand", position: "relative", marginTop: "-130px", zIndex: 2, backgroundColor: "white" }}>{`In Hand: ${playerData[playerId].hand.length}`}</div>
                    <div className={css.break}></div>
                    <PreviewZone {...{
                        instances: playerData[playerId].hand, zone: { zoneName: "Hand", rowId: 0 }, direction: "horizontal",
                        areaName: "PlayerHand"
                    }} />
                    <div className={css.CardPreview}>{card}</div>
                    <div className={css.DeckSettings}>
                        <DeckOptionsContainer setDeck={(cards, wielder) => { setPlayerDeckData(cards, wielder); }}
                            resetPlayer={(cards, wielder) => { setPlayerDeckData(cards, wielder); setLogData([]); }}
                            shuffleDeck={() => { handleShuffle(); }}
                            closePreview={() => { setActiveZone({zoneName: "Board", rowId: 0, colId: 0})}}
                            takeDamage={(amount) => {handleTakeDamage(amount)}} />
                    </div>
                    <PhaseSelector setPhase={setAndPostCurPhase} phase={curPhase}/>
                    <div className={css.GameLog} ref={logWindowRef}>{gameLogRender}</div>
                </div>
            </BoardContext.Provider>
            <DragOverlay dropAnimation={null}>
                {focusedCard ? (
                    (isCardVisible(focusedCard) || focusedCard.instanceId.toString().includes(PREVIEW_ID_POSTFIX)) ?
                        <CardInstance {...focusedCard}
                            activated={(focusedCard.zone.zoneName === "Board") && !focusedCard.instanceId.toString().includes(PREVIEW_ID_POSTFIX)
                                && (boardData[focusedCard.zone.rowId][focusedCard.zone.colId!]
                                    ?.activated ?? false)} />
                        : <FacedownCardInstance {...focusedCard} />
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}