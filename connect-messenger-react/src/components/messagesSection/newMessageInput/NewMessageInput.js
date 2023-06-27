import React, { useContext, useState } from "react";
import { ChatContext } from "../../../store/chats/ChatContext";
import "./NewMessageInput.scss";
import ChatAPI from "../../../store/ChatAPI";
import { Editor } from "./Editor";
import "./styles.css";
import {EditorContext} from "../../../store/editor/EditorContext";

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp']

const isImage = fileName =>
    IMAGE_EXTENSIONS.some(extension => fileName.endsWith(extension))

export const NewMessageInput = () => {
    const { state: {editors}, dispatch} = useContext(EditorContext)
    const { state: {chats, active}} = useContext(ChatContext)
    const [ fileContent, setFileContent ] = useState()
    const [ type, setType ] = useState('')
    const [ fileInputIcon, setFileInputIcon ] = useState("/images/image_icon.png")

    const setEditorState = editorContent => {
        dispatch({type: 'SET_EDITOR_CONTENT', chatId: active, editorContent})
    }

    const textContent = editors ? editors[active] : ''

    const handlePost = e => {
        e.preventDefault()

        if (type === 'TEXT' && textContent) {
            ChatAPI.postMessage(chats[active].id, type, textContent)
        } else if ((type === 'FILE' || type === 'IMG') && fileContent) {
            ChatAPI.postMessage(chats[active].id, type, fileContent)
        }

        setEditorState(null);
        setFileContent(null)
        setFileInputIcon("/images/image_icon.png")
    }

    const updateFileInput = e => {
        setFileContent(e.target.files[0])
        setEditorState('')
        console.log(e.target.files[[0]])
        if (isImage(e.target.files[0].name)) {
            setType('IMG')
            const r = new FileReader()
            r.readAsDataURL(e.target.files[0])
            r.onloadend = ev => setFileInputIcon(ev.target.result.toString())
        } else {
            setType('FILE')
            setFileInputIcon('/images/file-icon.png')
        }
    }

    const updateTextInput = html => {
        setEditorState(html)
        setFileContent(null)
        setType('TEXT')
        setFileInputIcon("/images/image_icon.png")
    }

    return (
        <form className="newMessageInput" onSubmit={handlePost}>
            <label htmlFor="message_img" className="newMessageInput__fileInputLabel">
                <img src={fileInputIcon} alt="Send" className="newMessageInput__fileInputLabel__img"/>
            </label>
            <input id="message_img" name="message_img" type="file" className="newMessageInput__fileInput"
                   accept="*"
                   onChange={updateFileInput}
            />
            <Editor editorContent={textContent} onEditorChanged={updateTextInput} />
            <input type="image" className="newMessageInput__btn" src="/images/send.png" alt="Send"/>
        </form>
    );
}
