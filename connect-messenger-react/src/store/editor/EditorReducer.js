export const editorReducer = (state, action) => {
    switch (action.type) {
        case 'SET_EDITOR_CONTENT': {
            state = { ...state, editors: { ...state.editors }}
            state.editors[action.chatId] = action.editorContent
            return state
        }
        default:
            console.log('dupa')
            return state
    }
}