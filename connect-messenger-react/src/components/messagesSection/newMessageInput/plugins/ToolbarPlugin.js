import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {SELECTION_CHANGE_COMMAND, FORMAT_TEXT_COMMAND, $getSelection, $isRangeSelection, $createParagraphNode, $getNodeByKey} from "lexical";
import {$wrapNodes,} from "@lexical/selection";
import {$getNearestNodeOfType, mergeRegister} from "@lexical/utils";
import {INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND, $isListNode, ListNode} from "@lexical/list";
import {createPortal} from "react-dom";
import {$createQuoteNode, $isHeadingNode} from "@lexical/rich-text";
import { $createCodeNode, $isCodeNode, getDefaultCodeLanguage, getCodeLanguages } from "@lexical/code";

const LowPriority = 1;

const supportedBlockTypes = new Set([
    "paragraph",
    "quote",
    "code",
    "ul",
    "ol"
]);

const blockTypeToBlockName = {
    code: "Code Block",
    ol: "Numbered List",
    paragraph: "Normal",
    quote: "Quote",
    ul: "Bulleted List"
};

const Divider = () => <div className="divider"/>


const Select = ({onChange, className, options, value}) =>
    <select className={className} onChange={onChange} value={value}>
        <option hidden={true} value=""/>
        {options.map((option) => (
            <option key={option} value={option}>
                {option}
            </option>
        ))}
    </select>

const BlockOptionsDropdownList = ({editor, blockType, toolbarRef, setShowBlockOptionsDropDown}) => {
    const dropDownRef = useRef()

    useEffect(() => {
        const toolbar = toolbarRef.current
        const dropDown = dropDownRef.current

        if (toolbar && dropDown) {
            const {top, left} = toolbar.getBoundingClientRect()
            dropDown.style.top = `${top + 40}px`
            dropDown.style.left = `${left}px`
        }
    }, [dropDownRef, toolbarRef])

    useEffect(() => {
        const dropDown = dropDownRef.current
        const toolbar = toolbarRef.current

        if (dropDown && toolbar) {
            const handle = event => {
                const target = event.target

                if (!dropDown.contains(target) && !toolbar.contains(target)) {
                    setShowBlockOptionsDropDown(false);
                }
            };
            document.addEventListener("click", handle)

            return () => document.removeEventListener("click", handle)
        }
    }, [dropDownRef, setShowBlockOptionsDropDown, toolbarRef])

    const formatParagraph = () => {
        if (blockType !== "paragraph") {
            editor.update(() => {
                const selection = $getSelection()

                if ($isRangeSelection(selection)) {
                    $wrapNodes(selection, () => $createParagraphNode())
                }
            })
        }
        setShowBlockOptionsDropDown(false)
    }

    const formatBulletList = () => {
        if (blockType !== "ul") {
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND)
        } else {
            editor.dispatchCommand(REMOVE_LIST_COMMAND)
        }
        setShowBlockOptionsDropDown(false)
    }

    const formatNumberedList = () => {
        if (blockType !== "ol") {
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND)
        } else {
            editor.dispatchCommand(REMOVE_LIST_COMMAND)
        }
        setShowBlockOptionsDropDown(false)
    }

    const formatQuote = () => {
        if (blockType !== "quote") {
            editor.update(() => {
                const selection = $getSelection()

                if ($isRangeSelection(selection)) {
                    $wrapNodes(selection, () => $createQuoteNode())
                }
            })
        }
        setShowBlockOptionsDropDown(false)
    }

    const formatCode = () => {
        if (blockType !== "code") {
            editor.update(() => {
                const selection = $getSelection()

                if ($isRangeSelection(selection)) {
                    $wrapNodes(selection, () => $createCodeNode())
                }
            })
        }
        setShowBlockOptionsDropDown(false)
    }

    return (
        <div className="dropdown" ref={dropDownRef}>
            <button className="item" onClick={e => {
                e.preventDefault()
                formatParagraph()
            }}>
                <span className="text">Normal</span>
                {blockType === "paragraph" && <span className="active"/>}
            </button>
            <button className="item" onClick={e => {
                e.preventDefault()
                formatBulletList()
            }}>
                <span className="text">Bullet List</span>
                {blockType === "ul" && <span className="active"/>}
            </button>
            <button className="item" onClick={e => {
                e.preventDefault()
                formatNumberedList()
            }}>
                <span className="text">Numbered List</span>
                {blockType === "ol" && <span className="active"/>}
            </button>
            <button className="item" onClick={e => {
                e.preventDefault()
                formatQuote()
            }}>
                <span className="text">Quote</span>
                {blockType === "quote" && <span className="active"/>}
            </button>
            <button className="item" onClick={e => {
                e.preventDefault()
                formatCode()
            }}>
                <span className="text">Code Block</span>
                {blockType === "code" && <span className="active"/>}
            </button>
        </div>
    )
}

export const ToolbarPlugin = () => {
    const [editor] = useLexicalComposerContext()
    const toolbarRef = useRef()
    const [blockType, setBlockType] = useState("paragraph")
    const [selectedElementKey, setSelectedElementKey] = useState()
    const [showBlockOptionsDropDown, setShowBlockOptionsDropDown] = useState(false)
    const [codeLanguage, setCodeLanguage] = useState("")
    const [isBold, setIsBold] = useState(false)
    const [isItalic, setIsItalic] = useState(false)
    const [isUnderline, setIsUnderline] = useState(false)
    const [isStrikethrough, setIsStrikethrough] = useState(false)
    const [isCode, setIsCode] = useState(false)

    const updateToolbar = useCallback(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode()
            const element =
                anchorNode.getKey() === "root"
                    ? anchorNode
                    : anchorNode.getTopLevelElementOrThrow()
            const elementKey = element.getKey()
            const elementDOM = editor.getElementByKey(elementKey)
            if (elementDOM !== null) {
                setSelectedElementKey(elementKey)
                if ($isListNode(element)) {
                    const parentList = $getNearestNodeOfType(anchorNode, ListNode)
                    const type = parentList ? parentList.getTag() : element.getTag()
                    setBlockType(type)
                } else {
                    const type = $isHeadingNode(element)
                        ? element.getTag()
                        : element.getType()
                    setBlockType(type)
                    if ($isCodeNode(element)) {
                        setCodeLanguage(element.getLanguage() || getDefaultCodeLanguage())
                    }
                }
            }
            // Update text format
            setIsBold(selection.hasFormat("bold"))
            setIsItalic(selection.hasFormat("italic"))
            setIsUnderline(selection.hasFormat("underline"))
            setIsStrikethrough(selection.hasFormat("strikethrough"))
            setIsCode(selection.hasFormat("code"))
        }
    }, [editor])

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({editorState}) => {
                editorState.read(() => {
                    updateToolbar()
                })
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                _payload => {
                    updateToolbar()
                    return false
                },
                LowPriority
            )
        );
    }, [editor, updateToolbar])

    const codeLanguages = useMemo(() => getCodeLanguages(), [])
    const onCodeLanguageSelect = useCallback(
        (e) => {
            editor.update(() => {
                if (selectedElementKey !== null) {
                    const node = $getNodeByKey(selectedElementKey)
                    if ($isCodeNode(node)) {
                        node.setLanguage(e.target.value)
                    }
                }
            })
        },
        [editor, selectedElementKey]
    )

    return (
        <div className="toolbar" ref={toolbarRef}>
            {supportedBlockTypes.has(blockType) && (
                <>
                    <button
                        className="toolbar-item block-controls"
                        onClick={e => {
                            e.preventDefault()
                            setShowBlockOptionsDropDown(!showBlockOptionsDropDown)
                        }}
                        aria-label="Formatting Options"
                    >
                        <span className={"icon block-type " + blockType}/>
                        <span className="text">{blockTypeToBlockName[blockType]}</span>
                        <i className="chevron-down"/>
                    </button>
                    {showBlockOptionsDropDown &&
                        createPortal(
                            <BlockOptionsDropdownList
                                editor={editor}
                                blockType={blockType}
                                toolbarRef={toolbarRef}
                                setShowBlockOptionsDropDown={setShowBlockOptionsDropDown}
                            />,
                            document.body
                        )}
                    <Divider/>
                </>
            )}
            {blockType === "code" ? (
                <>
                    <Select
                        className="toolbar-item code-language"
                        onChange={onCodeLanguageSelect}
                        options={codeLanguages}
                        value={codeLanguage}
                    />
                    <i className="chevron-down inside"/>
                </>
            ) : (
                <>
                    <button
                        onClick={e => {
                            e.preventDefault()
                            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")
                        }}
                        className={"toolbar-item spaced " + (isBold ? "active" : "")}
                        aria-label="Format Bold"
                    >
                        <i className="format bold"/>
                    </button>
                    <button
                        onClick={e => {
                            e.preventDefault()
                            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")
                        }}
                        className={"toolbar-item spaced " + (isItalic ? "active" : "")}
                        aria-label="Format Italics"
                    >
                        <i className="format italic"/>
                    </button>
                    <button
                        onClick={e => {
                            e.preventDefault()
                            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")
                        }}
                        className={"toolbar-item spaced " + (isUnderline ? "active" : "")}
                        aria-label="Format Underline"
                    >
                        <i className="format underline"/>
                    </button>
                    <button
                        onClick={e => {
                            e.preventDefault()
                            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
                        }}
                        className={
                            "toolbar-item spaced " + (isStrikethrough ? "active" : "")
                        }
                        aria-label="Format Strikethrough"
                    >
                        <i className="format strikethrough"/>
                    </button>
                    <button
                        onClick={e => {
                            e.preventDefault()
                            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")
                        }}
                        className={"toolbar-item spaced " + (isCode ? "active" : "")}
                        aria-label="Insert Code"
                    >
                        <i className="format code"/>
                    </button>
                </>
            )}
        </div>
    );
}
