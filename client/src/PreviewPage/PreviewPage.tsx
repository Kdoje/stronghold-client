import { useState } from 'react';
import { getUrl } from '../utils/FetchUtils';
import css from './PreviewPage.module.css'
import  {GAME_BOARD, DECK_EDITOR, PREVIEW_PAGE} from 'common/Routes'
import { AnyCardT } from 'common/types/game-data';
import Card from '../game/board/cards/Card';
import React from 'react';
import ProjectBlueCard from '../game/board/cards/ProjectBlueCard';
import Modal from 'react-modal';


const deckList = 
`3 Powerwell Core
3 Recruitment Drive
3 Marching Edict
3 Formation Enforcer
3 Squire Shieldbearer
3 Proclamation Initiate
3 Fatigue Forfeit
3 Shielding Maneuver
3 Triumphant Strike
3 Immobilizer
3 Dual Assault 
3 Vanguard Captain
3 Architect Sentinel
3 Deployment Commander
3 Ally Retrieval
3 Auror Strategist
3 Defense Captain
3 Fortress Beacon
3 Battlefront Keep
3 Tactical Observatory
3 Fleetfoot Manuever
3 Elimination Run
3 Marshal Guardian
3 Recruitment Strategist
3 Mire Fueling
3 Galewhisper Marsh
3 Reconnaisance
3 Marshbound Attendant
3 Safehaven Assailant
3 Domain Amplifier
3 Resurgence Oasis
3 Drainmind Reservoir
3 Lifethread Loyalist
3 Dredge Carver
3 Fatal Gaze Phantasm
3 Seeker Sentinel
3 Sacrificial Nexus
3 Fenan Conclave
3 Ambush Flats
3 Quicksilt Pits
3 Reclaimer's Enclave
3 Envirostrike
3 Crushing Collapse
3 Mire Trailblazer
3 Ritualist Pioneer
3 Enviroscribe
3 Hindering Haven
3 Nomad Hauler
3 Cataclysmic Collapse
3 S'hirgoth Cruhser
3 The Elder Shaman
3 Renew
3 Reactor Tower
3 Retaliator
3 Inferno Brandish
3 Inferno Wrecker
3 Rejuvinate
3 Pyrostrider Boost
3 Pyretic Retributor
3 Battalion Leader
3 Emberstrike
3 Guardian's Bastion
3 Firespite Beacon
3 Pyroclasmic Insight
3 Protective Enclave
3 Pyrofury Barren
3 Lavafield High Ground
3 Devestator Strike
3 Scorching Reckoning
3 Emberghost Strider
3 Samuel, Loyal Companion
3 Blazing Barrage
3 Pyrocrusher
3 Strategist Scryer
3 Calculated Strike
3 Hearthstoker Dragon
3 The Hound-bonded
`;

export default function PreivewPage() {
    const [curCards, setCurCards] = useState([] as AnyCardT[]);
    const [modalIsOpen, setIsOpen] = React.useState(false);
    let subtitle:  HTMLTextAreaElement;

    async function onSetDeckClick() {
        let requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify({ cardlist: subtitle.value })
        };

        const response = await fetch(`${getUrl()}/cardlist`, requestOptions);
        const data = await response.json();
        console.log("got decklist");
        let cards = data.list;
        setCurCards(cards);
        setIsOpen(false);
    }

    function onEnterDecklistClick() {
        setIsOpen(true);
    }

    let genDeckListButton = curCards.length > 0 ?
        undefined :
        <button onClick={() => onEnterDecklistClick()}>Enter Decklist</button>;
    
    let cardRenders: React.ReactElement[] = [];
    curCards.forEach((card) => {
        cardRenders.push(<ProjectBlueCard {...card}/>)
    });

    Modal.setAppElement("#modal");

    return (
        <div className={css.cardPreviews}>
            {genDeckListButton}
            <Modal isOpen={modalIsOpen} contentLabel="Deck Entry Modal">
                <h2 >Cardlist Print Entry</h2>
                <textarea ref={(_subtitle) => (subtitle = _subtitle)} placeholder="Enter Cardlist"/>
                <br/>
                <button onClick={() => onSetDeckClick()}>Submit</button>
            </Modal>
            {cardRenders}
        </div>
    )
}