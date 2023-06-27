import ExampleTheme from "./ExampleTheme"
import {LexicalComposer} from "@lexical/react/LexicalComposer"
import {RichTextPlugin} from "@lexical/react/LexicalRichTextPlugin"
import {ContentEditable} from "@lexical/react/LexicalContentEditable"
import {HistoryPlugin} from "@lexical/react/LexicalHistoryPlugin"
import {AutoFocusPlugin} from "@lexical/react/LexicalAutoFocusPlugin"
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary"
import {HeadingNode, QuoteNode} from "@lexical/rich-text"
import {TableCellNode, TableNode, TableRowNode} from "@lexical/table"
import {ListItemNode, ListNode} from "@lexical/list"
import {CodeHighlightNode, CodeNode} from "@lexical/code"
import {AutoLinkNode, LinkNode} from "@lexical/link"
import {ListPlugin} from "@lexical/react/LexicalListPlugin"
import {MarkdownShortcutPlugin} from "@lexical/react/LexicalMarkdownShortcutPlugin"
import {TRANSFORMERS} from "@lexical/markdown"
import {ToolbarPlugin} from "./plugins/ToolbarPlugin"
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin"
import {OnChangePlugin} from '@lexical/react/LexicalOnChangePlugin'
import {$generateHtmlFromNodes} from "@lexical/html"
import {UpdatePlugin} from "./plugins/UpdatePlugin"

const editorConfig = {
    // The editor theme
    theme: ExampleTheme,
    // Handling of errors during update
    onError(error) {
    },
    // Any custom nodes go here
    nodes: [
        HeadingNode,
        ListNode,
        ListItemNode,
        QuoteNode,
        CodeNode,
        CodeHighlightNode,
        TableNode,
        TableCellNode,
        TableRowNode,
        AutoLinkNode,
        LinkNode
    ]
}

export const Editor = ({editorContent, onEditorChanged}) => {
    return (
        <LexicalComposer initialConfig={editorConfig}>
            <div className="editor-container">
                <ToolbarPlugin/>
                <div className="editor-inner">
                    <RichTextPlugin
                        contentEditable={<ContentEditable className="editor-input"/>}
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <HistoryPlugin/>
                    <AutoFocusPlugin/>
                    <CodeHighlightPlugin/>
                    <ListPlugin/>
                    <UpdatePlugin editorContent={editorContent}/>
                    <OnChangePlugin onChange={(_, editor) => {
                        editor.update(() => {
                            onEditorChanged($generateHtmlFromNodes(editor))
                        })
                    }}/>
                    <MarkdownShortcutPlugin transformers={TRANSFORMERS}/>
                </div>
            </div>
        </LexicalComposer>
    )
}
