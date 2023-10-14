import { PhaseName } from 'common/types/game-data';
import css from './Board.module.css';

export default function PhaseSelector(props: {
    phase: PhaseName,
    setPhase: (phase: PhaseName) => void
}) {
    let phaseButtons = [] as JSX.Element[];
    Object.values(PhaseName).filter(value => typeof value === 'string').forEach((name) => {
        let style = {backgroundColor: 'lightblue', minHeight: '50px'};
        if (name.toString() === props.phase.toString()) {
            style = {backgroundColor: 'lightgreen', minHeight: '50px'}
        }
        phaseButtons.push(<button style={style} 
            onClick={() => { props.setPhase(name as PhaseName) }}>
                {name}</button>
                )
    })
    return <div
        className={css.Phase}>
            {...phaseButtons}
    </div>
}