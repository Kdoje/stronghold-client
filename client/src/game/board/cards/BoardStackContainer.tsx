import { BoardStackInstanceT } from 'common/types/game-data';
import css from '../Board.module.css';
import CardInstance from './CardInstance';
import { useContext } from 'react';
import { BoardContext } from '../BoardContext';


export default function BoardStackContainer(props: BoardStackInstanceT) {
    const handleActivate = useContext(BoardContext).handleActivate;
    const setFocusedCard = useContext(BoardContext).setFocusedCard;

    
    function onClick(e: React.MouseEvent) {
        if (props?.instances[0].zone && e.detail >= 2) {
            handleActivate(props?.instances[0].zone);
        }
    }

    let style = {}

    // TODO this will need to be mirrored for multi-player
    switch (props?.attacking) {
        case 'E':
            style = { transform: 'translate(25px, 0)' }
            break;
        case 'N':
            style = { transform: 'translate(0px, -30px)' }
            break;
        case 'S':
            style = { transform: 'translate(0px, 30px)' }
            break;
        case 'W':
            style = { transform: 'translate(-25px, 0)' }
            break;
    }

    return <div onClickCapture={onClick}
        style={style}>
        <CardInstance {...props!.instances[0]} activated={props!.activated} annotation={props?.annotation} />
    </div>
}