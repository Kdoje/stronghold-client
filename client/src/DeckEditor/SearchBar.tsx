import React, { useRef, useState } from "react";
import css from "./SearchBar.module.css";

export default function SearchBar(props: { placeholderText: string, onSubmit: (searchTerm: string) => void }) {

    const [searchTerm, setSearchTerm] = useState("");

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.code === "Enter") {
            props.onSubmit(searchTerm);
        }
    }

    return (<div className={css.container} onKeyDown={(e) => { handleKeyDown(e) }}>
        <input className={css.searchBox} type="text" placeholder={props.placeholderText}
            onChange={(e) => { setSearchTerm(e.target.value) }}/>
    </div>)
}
