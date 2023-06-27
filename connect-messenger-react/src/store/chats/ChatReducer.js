export const chatReducer = (state, action) => {
    switch (action.type) {
        case "ADD_MESSAGE": {
            const target = state.chats.reduce((total, c, i) => {
                if (c.id === action.newMessage.chatId)
                    return i;
                else return total;
            }, -1);
            if (target === -1) return state;
            console.log("target = " + target);
            const updatedMessages = [ ...state.chats[target].messages, action.newMessage ];
            const updatedChat = { ...state.chats[target], messages: updatedMessages };
            const updatedChats = [ ...state.chats ];
            updatedChats[target] = updatedChat;
            const messagesContainer = document.querySelector(".messages__container")
            if (messagesContainer)
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            return { ...state, chats: updatedChats };
        }
        case "SET_CHATS":
            console.log("SET_CHATS inside ChatReducer");
            return { ...state, chats: action.newChats };
        case "SET_ACTIVE":
            return { ...state, active: action.newActive };
        case "UPDATE_STATUS": {
            console.log("UPDATE STATUS action")
            console.log(action.newStatus)
            const target = state.chats.reduce((total, c, i) => {
                if (c.id === action.newStatus.id.chatId)
                    return i;
                else return total;
            }, -1);
            console.log("target = " + target);
            if (target === -1) return state;
            const updatedStatus = [ ...state.chats[target].status ];
            updatedStatus[updatedStatus[0].id.userId === action.newStatus.id.userId ? 0 : 1] = action.newStatus;
            const updatedChat = { ...state.chats[target], status: updatedStatus };
            const updatedChats = [ ...state.chats ];
            updatedChats[target] = updatedChat;
            return { ...state, chats: updatedChats };
        }
        case "ADD_CHAT": {
            return { ...state, chats: [...state.chats, action.newChat]}
        }
        case "CLEAR":
            return { chats: [], active: 0 };
        case 'ADD_REACTION': {  // newReaction: 'WOW', messageId: 34, chatId: 1
            console.log("ADD REACTION action")
            const foundChatIndex = state.chats.reduce((foundChatIndex, chat, i) => {
                if (chat.id === action.chatId)
                    return i
                else return foundChatIndex
            }, -1)
            if (foundChatIndex === -1) return state
            const updatedMessages = [ ...state.chats[foundChatIndex].messages ]
            const foundMessageIndex = updatedMessages.reduce((foundMessageIndex, message, i) => {
                if (message.id === action.messageId)
                    return i
                else return foundMessageIndex
            }, -1)
            updatedMessages[foundMessageIndex].reaction = action.newReaction
            const updatedChat = { ...state.chats[foundChatIndex], messages: updatedMessages }
            const updatedChats = [ ...state.chats ];
            updatedChats[foundChatIndex] = updatedChat;
            return { ...state, chats: updatedChats };
        }
        default:
            console.log(`No matching case for: ${action.type} inside chatReducer`);
            return state;
    }
}