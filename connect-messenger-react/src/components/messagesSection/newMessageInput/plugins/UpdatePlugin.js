import { $getRoot, $insertNodes } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {useEffect} from "react";
import {$generateNodesFromDOM} from "@lexical/html";

export const UpdatePlugin = ({ editorContent }) => {
    const [editor] = useLexicalComposerContext()

    const update = editorContent => {
        editor.update(() => {
            const root = $getRoot()
            root.clear()
            if (editorContent) {
                const parser = new DOMParser()
                const dom = parser.parseFromString(editorContent, 'text/html')
                root.select()
                $insertNodes($generateNodesFromDOM(editor, dom))
            }
        })
    }

    useEffect(() => {
        try {
            update(editorContent)
        } catch (e) {}
    // eslint-disable-next-line
    }, [editorContent])

    return null
}
