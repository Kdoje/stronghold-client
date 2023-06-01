import { BoardStackInstanceT } from 'common/types/game-data';
import css from '../Board.module.css';
import CardInstance from './CardInstance';


export default function BoardStackContainer(props: BoardStackInstanceT) {
    // TODO this will handle rendering the annotation, activation and attack
    return <div><CardInstance {...props!.instances[0]} /></div>
}