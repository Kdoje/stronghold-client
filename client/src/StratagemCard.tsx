import React from "react";


export type StratagemCardProps = {
    name: string
    cost: string
    type: string
    subtype: string
    description: string
    value: string
}


export class StratagemCard extends React.Component<StratagemCardProps> {
    render() {
        if (this.props.name === "") {
            return <div></div>;
        }
        let typeLineText = this.props.type;
        if (this.props.subtype && this.props.subtype.length > 0) {
            typeLineText += " - " + this.props.subtype;
        }
        let isGold = this.props.value === "G"
        let cardImage = "stratagem-card.png";
        if (this.props.value === "G") {
            cardImage = "stratagem-card-gold.png";
        }
            return <div className="card-container">
                <img className="portrait-image" src=""></img>
                <div className="title-text">{this.props.name}</div>
                <div className="cost-text">{this.props.cost}</div>
                <div className="type-text">{typeLineText}</div>
                <div className="description-text">{this.props.description}</div>
                <div className="value-text">{this.props.value}</div>
                <img className="card-image" src={cardImage}></img>

            </div>;
    }
}

