import React, {useEffect, useState} from "react";
import axios from "axios";
import "./Message.scss"
import {toUiFormat, toUiTooltipFormat} from "../../../dateFormatter";
import "./../newMessageInput/styles.css"
import {Reaction} from "./MessageReaction";
import ChatAPI, {baseURL} from "../../../store/ChatAPI";
import {faFile} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const getNthIndex = (str, char, n) =>
    str.split(char).slice(0, n).join(char).length;

const getOriginalFileName = fileNameWithId => {
    const secondUnderscoreIndex = getNthIndex(fileNameWithId, '_', 2)
    return fileNameWithId.substr(secondUnderscoreIndex + 1)
}

export const Message = React.forwardRef(
    ({
         message, isMine, isTopSticky, isBottomSticky, shouldDisplayDate, shouldDisplayDay, date
     }, ref) => {
        const [fileData, setFileData] = useState('')

        const fetchFile = async () =>
            await axios.get(`${baseURL}/message/file/${message.content}`, {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            })

        useEffect(() => {
            if (message.type === 'IMG' || message.type === 'FILE') {
                console.log('fetching image')
                fetchFile()
                    .then(res => setFileData(`data:text/plain;base64,${res.data}`))
            }
            // eslint-disable-next-line
        }, [message])

        const classNames = [
            'singleMessage',
            `singleMessage--${isMine ? 'myMsg' : 'receivedMsg'}`,
            isTopSticky ? 'singleMessage--topSticky' : '',
            isBottomSticky ? 'singleMessage--bottomSticky' : ''
        ]

        return (
            <>
                {shouldDisplayDate &&
                    <div className="singleMessage__time">
                        {toUiFormat(date, shouldDisplayDay)}
                    </div>}
                {
                    message.type === 'TEXT' ?
                        <div ref={ref} id={`messageId${message.id}`} className={classNames.join(' ')}>
                            <div dangerouslySetInnerHTML={{__html: message.content}}></div>
                            <div className="singleMessage__tooltip">{toUiTooltipFormat(date)}</div>
                            <Reaction reaction={message.reaction} canExpand={!isMine} onChange={r => {
                                if (r === message.reaction) {
                                    ChatAPI.addReaction(message.id, undefined)
                                } else {
                                    ChatAPI.addReaction(message.id, r)
                                }
                            }} />
                        </div>
                        : message.type === 'IMG' ?
                        <div ref={ref} id={`messageId${message.id}`}
                             className={`${classNames.join(' ')} singleMessage--img`}>
                            <a
                                href={fileData}
                                download={getOriginalFileName(message.content)}
                                className="singleMessage__img"
                            >
                                <img src={fileData} alt="" className="singleMessage__img"/>
                            </a>
                        </div>
                        :
                        <div ref={ref} id={`messageId${message.id}`}
                            className={`${classNames.join(' ')} singleMessage--file`}
                        >
                            <a
                                className="singleMessage--file__link"
                                href={fileData}
                                download={getOriginalFileName(message.content)}
                            >
                                <FontAwesomeIcon className="singleMessage--file__icon" size="lg" icon={faFile} />
                                <span>{getOriginalFileName(message.content)}</span>
                            </a>
                        </div>
                }
            </>
        )
    })
