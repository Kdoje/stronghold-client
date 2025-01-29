import React, { ReactElement } from "react";
import {AnyCardT} from 'common/types/game-data'; 
import css from "./ProjectBlueCard.module.css"
import { getUrl } from "../utils/FetchUtils";
import TRANSLATIONS from "../utils/Translations";

const SLUG_TEXTS = ["Play", "Hit", "End"]

export default class ProjectBlueCard extends React.Component<AnyCardT & {displayOverlay?: boolean}> {

    constructor(props: AnyCardT & {displayOverlay?: boolean}) {
        super(props);
    }

    getTypeName() {
        if (this.props.type === "Wielder") {
            return "Duelist";
        }
        return this.props.type;
    }

    getFlavorText() {
        if (this.props.type === "Wielder") {
            return "";
        }
        return TRANSLATIONS["flavor"];
    }

    generateDescriptionContent() {
        let [requirement, clauses] = this.getCardDetails();
        let requirementView = requirement ? <div className={css.requirement}>{requirement}</div> : <></>
        let description = <>
            {requirementView}
            <div className={css.clauseList}>
                {clauses.map((clause) =>  {
                    const match = clause.matchAll(/^(.*?:)(.*)/sgm).toArray()[0];
                    console.log('match below');
                    let effect = match[2].replaceAll(/\*/g, "◆")
                    let effectView = <p className={css.clause_effect_text}>
                        {effect.split(/\n/g).map(val => val ? <>{val}<br/></> : <></>)}
                    </p>
                    console.log(effect)
                    let clauseView = <div className={css.clause}>
                            <div className={css.clause_slug}>{match ? match[1].toLocaleUpperCase() : ""}</div>
                            <div className={css.clause_effect}>{effectView}</div>
                        </div>
                    return clauseView
                })}
            </div>
        </>


        console.dir(clauses);
        console.log(requirement);
        return description;
    }

    private getCardDetails() : [string, string[]] {
        // get a list of condition text, (clause, effect), (...)
        const matcher = `((.*?\n?)((On (${SLUG_TEXTS.join('|')}):).*?\n?))`;

        let clauseMatcher = new RegExp(matcher, "gms");
        
        const sanitizedDescription = this.props.description.replaceAll('\r\n', '\n');

        let requirementText = "";
        let clauses: string[] = [];

        // uses the matcher to get the requirement and clauses
        let matches = sanitizedDescription.matchAll(clauseMatcher).toArray();
        matches.forEach((match, index) => {
            // group 0 of match 0 is the requirement
            if (index == 0) {
                requirementText = match[2];
                console.log(requirementText);
            }
            // then get the text from group 4 of this match to group 2 of the next match
            let startCaptureIndex = match.index + match[0].indexOf(match[4]);
            let endCaptureIndex;
            if (index + 1 == matches.length) {
                endCaptureIndex = sanitizedDescription.length;
            } else {
                let nextMatch: RegExpExecArray = matches[index + 1];
                endCaptureIndex = nextMatch.index + nextMatch[2].length;
            }
            console.log(`Captured Group: ${match[4]} Start: ${startCaptureIndex} End: ${endCaptureIndex}`);
            clauses.push(sanitizedDescription.substring(startCaptureIndex, endCaptureIndex));
        });
        return [requirementText, clauses];
    }

    render() {
        let cardImage = "ProjectBlueCardFrame.png";
        let initialHealth;
        if (this.props.health !== "" && this.props.health != null) {
            initialHealth = this.props.health.split('|')[0];
        }        
       
        let titleStyle: React.CSSProperties|undefined = {};
        if (this.props.name.length > 20) {
            titleStyle.fontSize = "10px";
        }

        let cardColor = "#e8ab10";
        switch(this.props.type) {
            case "Chordarm":
                cardColor = "#0fc7db"
                break;
            case "Dagger":
                cardColor = "#ed2000"
                break;
            case "Guantlet": 
                cardColor = "#009626"
                break;
            case "Longarm": 
                cardColor = "#6f00ed"
                break;
            case "Bolter":
                cardColor = "#fafa00"
                break;

        }

        let costImage: React.ReactElement = <></>
        if (this.props.cost != "") {
            costImage = <img className={css.costImage} src={`cost-${this.props.cost}.png`}></img>;
        }

        let descriptionStyle: React.CSSProperties|undefined;
        if (this.props.description.length > 150) {
            descriptionStyle = {top: "225px"}
        }

        let imgSrc = `${getUrl()}/cardimage/${this.props.name}`
        let jaTitleText = "";

        let elt = <div className={css.cardContainer}>
            <img className={css.portraitImage} src={imgSrc}></img>
            <div className={css.titleOverlayText}>{this.props.displayOverlay ? this.props.name + ":" + this.props.cost : undefined}</div>
            <div className={css.titleText} style={titleStyle}>{this.props.name}</div>
            <div className={css.subTypeText}>{this.getTypeName().toLocaleUpperCase()} </div>
            <div className={css.typeText}>{this.props.subtype?.toLocaleUpperCase()} </div>
            <div className={css.description} style={descriptionStyle}>{this.generateDescriptionContent()}</div>
            <div className={css.valueText}>{this.props.value + " " + this.props.rarity}</div>
            <div className={css.costText}>{this.props.cost}</div>
            <img className={css.cardImage} style={{filter: `opacity(80%) drop-shadow(0 0 0 ${cardColor})`}} src={cardImage}></img>
        </div>;

        return elt;

    }
}

