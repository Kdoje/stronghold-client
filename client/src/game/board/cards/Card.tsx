import React, { ReactElement } from "react";
import {AnyCardT, UnitCardT} from 'common/types/game-data'; 
import css from "./Card.module.css"
import { getUrl } from "../../../utils/FetchUtils";

type CardTemplate = "Unit"|"Stratagem"|"Structure";
type RulesText = "Tactic"|"Reaction"|"Structure"|"Stratagem"|undefined;

export default class Card extends React.Component<AnyCardT & {displayOverlay?: boolean}> {
    constructor(props: AnyCardT & {displayOverlay?: boolean}) {
        super(props);
    }

    render() {

        let template: CardTemplate = "Stratagem";
        if (this.props.subtype === "Unit" || this.props.type === "Wielder") {
            template = "Unit";
        } if (this.props.subtype === "Structure") {
            template = "Structure";
        }

        let cardImage = "StratagemCardTemplate.png";
        if (template === "Unit") {
            cardImage = "UnitCardTemplate.png";
        } else if (template === "Structure") {
            cardImage = "StructureCardTemplate.png";
        }

        let initialHealth;
        if (this.props.health !== "" && this.props.health != null) {
            initialHealth = this.props.health.split('|')[0];
        }        
       
        let titleStyle: React.CSSProperties|undefined = undefined;
        if (this.props.name.length > 25) {
            titleStyle = {fontSize: "12px"};
        }

        let statsText;
        let healthText;
        if (initialHealth != null) {
            healthText = <div className={css.healthText}>{initialHealth}</div>;
            statsText = <div className={css.statsOverlayContainer}>
                <p className={css.statsOverlayText}>{this.props.move}</p>
                <p className={css.statsOverlayText}>{this.props.attack}/{initialHealth}</p>
            </div>
        }

        let moveText;
        if (this.props.move != null && template !== "Structure") {
            moveText = <div className={css.moveText}>{this.props.move}</div>
        }
        
        let attackText;
        if (this.props.attack != null  && template !== "Structure") {
           attackText = <div className={css.attackText}>{this.props.attack}</div>;
        } 

        let rules: RulesText;
        let rulesRender: ReactElement;
        if (this.props.description.length < 150) {
            if (this.props.subtype === "Stratagem") {
                rules = "Stratagem";
            } if (this.props.description.includes("Reaction:")) {
                rules = "Reaction"
            } else if (this.props.subtype === "Tactic") {
                rules = "Tactic";
            } else if (this.props.subtype === "Structure") {
                rules = "Structure";
            }
        }

        if (rules != null) {
            let rulesTextStyle: React.CSSProperties = {fontSize: "5pt"};
            let rulesText = "Whenever occupant reaction(s) are triggered, " +
            "begin with the active player and continue " +
            "clockwise. Each play er applies their " +
            "occupant reaction(s) in any order.";
            if (rules === "Stratagem") {
                rulesText = "You may play Stratagems during your " +
                "deployment phase while no Tactics or " +
                "Reactions are waiting to be applied. " +
                "Discard this after applying its affect.";
            } else if (rules === "Tactic") {
                rulesText = "Before phases, start with the active player " +
                "and continue clockwise, that player may " +
                "play tactics onto the pile. Once everyone " +
                "passes, continue to apply and discard " +
                "the top pile card.";
            } else if (rules === "Structure") {
                rulesText = "Structures occupy the tile they are  " +
                "deployed in. Other occupants cannot " +
                "move through occupied tiles.";
            }
            rulesRender = <div className={css.rulesContainer}>
                <img className={css.rulesContainer} src="RulesTextTemplate.png"/>
                <p className={css.rulesText} style={rulesTextStyle}>{rulesText}</p>
                </div>
        }

        let imgSrc = `${getUrl()}/cardimage/${this.props.name}`

        let elt = <div className={css.cardContainer}>
            <img className={css.portraitImage} src={imgSrc}></img>
            <div className={css.titleOverlayText}>{this.props.displayOverlay ? this.props.name + ":" + this.props.cost : undefined}</div>
            <div className={css.titleText} style={titleStyle}>{this.props.name}</div>
            <div className={css.costText}>{this.props.cost}</div>
            <div className={css.typeText}>{this.props.type} - {this.props.subtype}</div>
            <div className={css.descriptionText}>{this.props.description}</div>
            {moveText}
            {healthText}
            {attackText}
            <div className={css.valueText}>{this.props.value + " " + this.props.rarity}</div>
            <img className={css.cardImage} src={cardImage}></img>
            {rulesRender}
            {this.props.displayOverlay ? statsText : undefined}
        </div>;

        return elt;

    }
}

