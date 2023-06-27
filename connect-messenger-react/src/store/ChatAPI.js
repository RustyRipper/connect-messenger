import jwt_decode from "jwt-decode";
import SockJS from "sockjs-client";
import {Stomp} from "@stomp/stompjs";
import {nowToSql} from "../dateFormatter";
import axios from "axios";

export const baseURL = `http://${window.location.hostname}:8080`
const api = axios.create({baseURL});

class ChatAPI {
    static socket;
    static stompClient;
    static authDetails;

    static async signIn(username, password) {
        try {
            const res = await api.post("/login",
                JSON.stringify({username, password}),
                {
                    headers: {
                        Accept: "application/json, text/plain, */*",
                        "Content-Type": "application/json"
                    }
                }
            );
            if (res.status === 200) {
                const token = res.headers.authentication;
                localStorage.setItem("token", token);
                this.authDetails = jwt_decode(token);
                return true;
            }
        } catch (e) {
            return false;
        }
    }

    static async signInWithGoogle() {
        try {
            const res = await api.get("/oauth2/authorization/google")
            if (res.status === 200) {
                const token = res.headers.authentication;
                localStorage.setItem("token", token);
                this.authDetails = jwt_decode(token);
                return true;
            }
        } catch (e) {
            return false;
        }
    }

    static isSignedIn() {
        if (!localStorage.getItem("token")) return false;

        if (!this.authDetails) {
            this.authDetails = jwt_decode(localStorage.getItem("token"));

            if (Date.now() >= this.authDetails.exp * 1000) {
                localStorage.removeItem("token");
                this.authDetails = null;
                return false;
            }
        }
        return true;
    }

    static getAuthDetails() {
        if (!this.isSignedIn()) {
            throw new Error("User isn't signed in!");
        } else {
            if (!this.authDetails) {
                this.authDetails = jwt_decode(localStorage.getItem("token"));
            }
            return this.authDetails;
        }
    }

    static signOut() {
        if (this.stompClient) {
            this.stompClient.disconnect(() => console.log("Disconnected from websocket, this equals: ", this));
            this.stompClient = null;
        }

        localStorage.removeItem("token");
        this.authDetails = null;
    }

    static async signUp(name, surname, username, password) {
        const formData = new FormData()
        formData.append('name', name)
        formData.append('surname', surname)
        formData.append('username', username)
        formData.append('password', password)
        const res = await api.post("/user/sign-up", formData)
        if (res.status === 200) {
            console.log('success')
        }
    }

    static initWebsocket(chats, messageCallback, newChatCallback, reactionCallback) {
        if (!this.isSignedIn()) {
            throw new Error("User isn't signed in!");
        }
        if (this.stompClient) {
            throw new Error("Websocket is already opened!");
        }
        this.stompClient = Stomp.over(
            () => new SockJS(`${baseURL}/websocket`)
        );
        this.stompClient.connect(
            {
                Authentication: localStorage.getItem("token")
            },
            () => {
                this.password = undefined;
                this.stompClient.subscribe(`/topic/new-chats/${this.authDetails.id}`, newChatCallback)
                chats.forEach(chat => {
                    this.stompClient.subscribe(`/topic/messages/${chat.id}`, messageCallback);
                    this.stompClient.subscribe(`/topic/reactions/${chat.id}`, reactionCallback);
                })
            }
        )
    }

    static subscribeToChat(chatId, callback) {
        if (!this.isSignedIn()) {
            throw new Error("User isn't signed in!");
        }
        if (!this.stompClient) {
            throw new Error("Websocket connection doesn't exists. Call initWebsocket() method first.");
        }
        this.stompClient.subscribe(`/topic/messages/${chatId}`, callback);
    }

    static async loadAllChats() {
        if (!this.isSignedIn()) {
            throw new Error("User isn't signed in!");
        }
        const res = await api.get(`/chats/${this.getAuthDetails().id}`, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        });
        return res.data;
    }

    /* puts new status to api, when I read unseen message */

    /* performs request through axios,
     * api sends status update through websocket,
     * chatReducer performs context update
     * useEffect is launched once again, but then specific messages (their IDs) are equal and nothing happens
     * */
    static updateStatus(chatId, messageId) {
        if (!this.isSignedIn()) {
            throw new Error("User isn't signed in!");
        }
        console.log({
            id: {
                chatId,
                userId: this.getAuthDetails().id
            },
            messageId,
            time: nowToSql()
        });
        api.put("/status",
            {
                id: {
                    chatId,
                    userId: this.getAuthDetails().id
                },
                messageId,
                time: nowToSql()
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: localStorage.getItem("token")
                }
            }
        );
    };

    static postMessage(chatId, type, content) {
        if (!this.isSignedIn()) {
            throw new Error("User isn't signed in!");
        }
        const formData = new FormData()
        formData.append('chatId', chatId)
        formData.append('userId', this.getAuthDetails().id)
        formData.append('time', nowToSql())
        formData.append('type', type)
        formData.append(type === 'TEXT' ? 'textContent' : 'fileContent', content)
        console.log('content')
        console.log(content)
        api.post("/message", formData,
            {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            }
        );
    }

    static async searchUsersByQuery(query) {
        if (!this.isSignedIn()) {
            throw new Error("User isn't signed in!");
        }
        const res = await api.get(`/user/${query}`, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        });
        return res.data;
    }

    static async createChat(recipientId) {
        if (!this.isSignedIn()) {
            throw new Error("User isn't signed in")
        }
        const res = await api.post('/chats', {
                userIds: [this.getAuthDetails().id, recipientId]
            },
            {
                headers: {
                    Authorization: localStorage.getItem("token")
                },

            })
        return res.data
    }

    static async addReaction(messageId, reaction) {
        if (!this.isSignedIn()) {
            throw new Error("User isn't signed in")
        }
        const url = `/message/reaction/${messageId}${reaction ? `/${reaction}` : ''}`
        const res = await api.put(url, {}, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        })
        console.log('addReaction')
        return res.data
    }
}

export default ChatAPI
