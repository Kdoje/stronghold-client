import React, { ReactElement } from "react";
import {AnyCardT, UnitCardT} from 'common/types/game-data'; 
import css from "./Card.module.css"
import { getUrl } from "../utils/FetchUtils";

type CardTemplate = "Unit"|"Stratagem"|"Structure"|"Wielder";
type RulesText = "Tactic"|"Reaction"|"Structure"|"Stratagem"|"Wielder"|undefined;

const TEXT_SHADOW_VALUE = "1px 0px 0px #fff, 0px -1px 0px #fff, -1px 0px 0px #fff, 0px 1px 0px #fff";
const HALF_SHADOW_VALUE = "1px 0px 0px #fff, 0px 1px 0px #fff"

export default class Card extends React.Component<AnyCardT & {displayOverlay?: boolean}> {

    constructor(props: AnyCardT & {displayOverlay?: boolean}) {
        super(props);
    }

    getTypeName() {
        if (this.props.type === "Wielder") {
            return "Character";
        }
        return this.props.type;
    }

    render() {

        let template: CardTemplate = "Stratagem";
        if (this.props.type === "Wielder") {
            template = "Wielder"
        }
        if (this.props.subtype === "Unit") {
            template = "Unit";
        } if (this.props.subtype === "Structure") {
            template = "Structure";
        }

        let cardImage = "StratagemCardTemplate.png";
        if (template === "Unit") {
            cardImage = "UnitCardTemplate.png";
        } else if (template === "Structure") {
            cardImage = "StructureCardTemplate.png";
        } else if (template === "Wielder") {
            cardImage = "CharacterCardTemplate.png";
        }

        let initialHealth;
        if (this.props.health !== "" && this.props.health != null) {
            initialHealth = this.props.health.split('|')[0];
        }        
       
        let titleStyle: React.CSSProperties|undefined = {};
        if (this.props.name.length > 25) {
            titleStyle.fontSize = "12px";
        }

        if (this.props.type === "Wielder") {
            titleStyle.justifyContent = "center";
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
        
        

        let portraitStyle: React.CSSProperties|undefined;
        let descriptionStyle: React.CSSProperties|undefined;
        let attackStyle: React.CSSProperties|undefined;
        if (template === "Wielder") {
            portraitStyle = {height: "3in", width: "2.5in"};
            descriptionStyle = {textShadow: TEXT_SHADOW_VALUE, top: "228px"}
            attackStyle = {left: "195px", top: "292px"}
        }

        let attackText;
        if (this.props.attack != null  && template !== "Structure") {
           attackText = <div className={css.attackText} style={attackStyle}>{this.props.attack}</div>;
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
            } else if (template === "Wielder") {
                rules = "Wielder";
            }
        }

        if (rules != null) {
            let rulesTemplate = "Unit"
            let rulesTextStyle: React.CSSProperties = {fontSize: "7.5pt", textShadow: HALF_SHADOW_VALUE};
            let rulesText = "Apply reactions starting " +
            "with the active player's occupants continuing clockwise.";
            if (rules === "Stratagem") {
                rulesText = "The active player may deploy Strategems " +
                "during their deployment phase."
            } else if (rules === "Tactic") {
                rulesText = "Deploy tactics before phases onto " +
                "the pile. Then, apply and discard them in pile order";
            } else if (rules === "Structure") {
                rulesText = "Structures occupy the tile they are " +
                "deployed in.";
            } else if (rules === "Wielder") {
                rulesText = "This represents your abilities and position on the field";
            }
            rulesRender = <div className={css.rulesContainer}>
                <img className={css.rulesContainer} src={`${rulesTemplate}RulesTextTemplate.png`}/>
                <p className={css.rulesText} style={rulesTextStyle}>{rulesText}</p>
                </div>
        }

        let imgSrc = `${getUrl()}/cardimage/${this.props.name}`

        let elt = <div className={css.cardContainer}>
            <img className={css.portraitImage} style={portraitStyle} src={imgSrc}></img>
            <div className={css.titleOverlayText}>{this.props.displayOverlay ? this.props.name + ":" + this.props.cost : undefined}</div>
            <div className={css.titleText} style={titleStyle}>{this.props.name}</div>
            <div className={css.costText}>{this.props.cost}</div>
            <div className={css.typeText}>{this.getTypeName()} - {this.props.subtype}</div>
            <div className={css.descriptionText} style={descriptionStyle}>{this.props.description}</div>
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

