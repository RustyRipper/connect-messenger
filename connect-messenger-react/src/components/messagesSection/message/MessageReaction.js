import React, {useEffect, useState} from 'react'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {
    faHeart,
    faSmileBeam,
    faSadTear,
    faThumbsUp,
    faAngry,
    faFaceSurprise,
    faAdd
} from "@fortawesome/free-solid-svg-icons"

const reactionToIconAndColor = reaction => {
    switch (reaction) {
        case 'HEART':
            return {icon: faHeart, color: '#e00'}
        case 'SMILE':
            return {icon: faSmileBeam, color: '#ba1'}
        case 'WOW':
            return {icon: faFaceSurprise, color: '#ba1'}
        case 'SAD':
            return {icon: faSadTear, color: '#ba1'}
        case 'ANGRY':
            return {icon: faAngry, color: '#ba1'}
        case 'LIKE':
            return {icon: faThumbsUp, color: '#ba1'}
        default:
            return {icon: undefined, color: undefined}
    }
}

const reactions = ['HEART', 'SMILE', 'WOW', 'SAD', 'ANGRY', 'LIKE']

export const Reaction = ({reaction, canExpand, onChange}) => {
    const [isExpanded, setExpanded] = useState(false)

    const {icon, color} = reactionToIconAndColor(reaction)

    useEffect(() => {
        const handle = event => {
            if (event.target.parentNode?.nodeName !== 'svg')
                setExpanded(false)
        }
        setTimeout(() => document.addEventListener("click", handle), 100)

        return () => document.removeEventListener("click", handle)
    }, [isExpanded, setExpanded])

    if (!reaction && !canExpand)
        return null

    if (!canExpand)
        return (
            <div className="singleMessage__reaction singleMessage__reaction--alwaysVisible">
                <FontAwesomeIcon icon={icon} style={{color: color}}/>
            </div>
        )

    return (<>{
        isExpanded ?
            <div className="singleMessage__reaction singleMessage__reaction--expanded singleMessage__reaction--hoverable">
                {
                    reactions.map(r => {
                        const {icon, color} = reactionToIconAndColor(r)
                        return (
                            <FontAwesomeIcon
                                key={r}
                                icon={icon}
                                size={r === reaction ? 'lg' : 'sm'}
                                style={{color: color}}
                                onClick={() => {
                                    setExpanded(false)
                                    onChange(r)
                                }}
                            />
                        )
                    })
                }
            </div>
            :
            <div
                className={`singleMessage__reaction singleMessage__reaction--expandable singleMessage__reaction--hoverable ${reaction && 'singleMessage__reaction--alwaysVisible'}`}>
                <FontAwesomeIcon
                    icon={reactionToIconAndColor(reaction)?.icon || faAdd}
                    style={{color: reactionToIconAndColor(reaction)?.color || '#555'}}
                    onClick={() => setExpanded(true)}/>
            </div>
    }</>)
}