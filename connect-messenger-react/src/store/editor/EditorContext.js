import { createContext, useReducer } from "react"
import { editorReducer } from "./EditorReducer"

export const EditorContext = createContext()

const EditorContextProvider = ({ children }) => {
    const [ state, dispatch ] = useReducer(editorReducer, { editors: {} })

    return (
        <EditorContext.Provider value={{state, dispatch}}>
            {children}
        </EditorContext.Provider>
    )
}

export default EditorContextProvider