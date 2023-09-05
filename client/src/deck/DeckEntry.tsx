import ReactDOM from "react-dom"
import css from './DeckEntry.module.css'
import { useRef } from "react"

function DeckEntry(props: { onClose: () => void, onAccept: (inputData: string) => void }) {
    const modalEl = document.getElementById('modal')
    const inputRef = useRef<HTMLTextAreaElement | null>(null)
    function acceptInput() {
        console.log("accepting input")
        if (!inputRef.current) {
            props.onAccept("");
        }
        props.onAccept(inputRef.current!.value)
    }
    if (!modalEl) return null
    return ReactDOM.createPortal(
        <div className={css.modalWrapper}>
            <div className={css.modal}>
                <div className={css.topLine}>
                    <div className={css.title}>{"Enter Deck Data"}</div>
                </div>

                <textarea className={css.decklistInput} placeholder="Enter Decklist" ref={inputRef} />
                <div className={css.buttonContainer}>
                    <button onClick={() => {acceptInput()}}>Accept</button>
                    <button onClick={props.onClose}>Cancel</button>
                </div>
            </div>
        </div>,
        modalEl
    )
}

export default DeckEntry