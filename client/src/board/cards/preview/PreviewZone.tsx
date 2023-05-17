
import { CardInstanceT, ZoneIdT } from "common/types/game-data";
import css from '../../Board.module.css' 
import CardInstance from "../CardInstance";

export type PreviewZoneDataT = {
    instances: Array<CardInstanceT>
    zoneId: ZoneIdT
}

export default function PreviewZone(props: PreviewZoneDataT) {
    // TODO this will handle rendering the members of a board stack and 
    // allow a user to move cards in and out of a stack
    return <div>{`${props.instances.length}, ${props.zoneId}`}</div>
}