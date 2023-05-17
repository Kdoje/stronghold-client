import { BoardStackInstanceT } from 'common/types/game-data';
import css from '../Board.module.css';
import CardInstance from './CardInstance';


export default function BoardStackContainer(props: BoardStackInstanceT) {
    // TODO this will handle rendering the annotation and activation
    return <div className={css.instanceWrapper}><CardInstance {...props!.instances[0]} /></div>
}