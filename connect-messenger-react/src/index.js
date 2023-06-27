import React from "react";
import {createRoot} from "react-dom/client";
import "./styles/base.scss";
import App from "./App";
import AuthContextProvider from "./store/auth/AuthContext";
import ChatContextProvider from "./store/chats/ChatContext";
import EditorContextProvider from "./store/editor/EditorContext";

const root = createRoot(document.getElementById("root"))

root.render(
    <AuthContextProvider>
        <ChatContextProvider>
            <EditorContextProvider>
                <App/>
            </EditorContextProvider>
        </ChatContextProvider>
    </AuthContextProvider>
)
