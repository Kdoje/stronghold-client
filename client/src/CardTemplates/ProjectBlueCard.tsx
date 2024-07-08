import React, { ReactElement } from "react";
import {AnyCardT} from 'common/types/game-data'; 
import css from "./ProjectBlueCard.module.css"
import { getUrl } from "../utils/FetchUtils";
import TRANSLATIONS from "../utils/Translations";

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

    render() {
        let cardImage = "ProjectBlueCardFrame.png";
        let initialHealth;
        if (this.props.health !== "" && this.props.health != null) {
            initialHealth = this.props.health.split('|')[0];
        }        
       
        let titleStyle: React.CSSProperties|undefined = {};
        if (this.props.name.length > 25) {
            titleStyle.fontSize = "7px";
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
            <div className={css.titleText} style={titleStyle}>{this.props.name.toLocaleUpperCase()}</div>
            <div className={css.jaTitleText}>{TRANSLATIONS[this.props.name.toLocaleLowerCase()]}</div>
            {costImage}
            <div className={css.jaTypeText}>{TRANSLATIONS[this.getTypeName().toLocaleLowerCase()]}</div>
            <div className={css.typeText}>{this.getTypeName().toLocaleUpperCase()} </div>
            <div className={css.descriptionText} style={descriptionStyle}>{this.props.description}</div>
            <div className={css.flavorText} style={descriptionStyle}>{this.getFlavorText()}</div>
            <div className={css.valueText}>{this.props.value + " " + this.props.rarity}</div>
            <img className={css.cardImage} src={cardImage}></img>
        </div>;

        return elt;

    }
}

