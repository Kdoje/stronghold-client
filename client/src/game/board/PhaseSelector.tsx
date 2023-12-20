import { PhaseName } from 'common/types/game-data';
import css from './Board.module.css';
import { useContext } from 'react';
import { BoardContext } from './BoardContext';

export default function PhaseSelector(props: {
    phase: PhaseName,
    setPhase: (phase: PhaseName) => void
}) {
    const drawCardFromDeck = useContext(BoardContext).drawCardFromDeck;
    const refreshPlayerOccupants = useContext(BoardContext).refreshPlayerOccupants;
   
    function handlePhaseChange(name: PhaseName) {
        if (name.toString() === PhaseName[PhaseName.Draw] && props.phase.toString() === PhaseName[PhaseName.Draw]) {
            drawCardFromDeck();
        } else if (name.toString() === PhaseName[PhaseName.Refresh] && props.phase.toString() === PhaseName[PhaseName.Refresh]) {
            refreshPlayerOccupants();
        } else {
            props.setPhase(name as PhaseName)
        }
    }

    let phaseButtons = [] as JSX.Element[];
    Object.values(PhaseName).filter(value => typeof value === 'string').forEach((name) => {
        let style = { backgroundColor: 'lightblue', minHeight: '50px' };
        if (name.toString() === props.phase.toString()) {
            style = { backgroundColor: 'lightgreen', minHeight: '50px' }
        }
        phaseButtons.push(<button style={style}
            onClick={() => { handlePhaseChange(name as PhaseName) }}>
            {name}</button>
        )
    })
    return <div
        className={css.Phase}>
        {...phaseButtons}
    </div>
}