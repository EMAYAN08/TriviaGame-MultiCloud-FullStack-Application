import React, { useState, useEffect, useRef } from "react";
import styles from '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { ChatContainer, MessageList, Message, MessageInput } from '@chatscope/chat-ui-kit-react';
import { Button, Offcanvas } from 'react-bootstrap';
import { chatSocket } from "../constants/constants";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';

function Chat(props) {
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const [showChatContainer, setShowChatContainer] = useState(false);
    const [messages, setMessages] = useState([]);
    const { teamId } = props;
    console.log(teamId);
    let socketRef = useRef(null);

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = new WebSocket(chatSocket);

            socketRef.current.onopen = () => {
                console.log('WebSocket connection established.');
            };

            socketRef.current.onmessage = (event) => {
                const message = JSON.parse(event.data);
                console.log("msg", message);
                if(message.message !== "Internal server error") {
                    console.log(message);
                    setMessages((prevValue) => [...prevValue, message]);
                }
            };

            socketRef.current.onclose = (event) => {
                console.log('WebSocket connection closed:', event.code, event.reason);
            };

            socketRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        }

        return () => {
            socketRef.current.close();
        }
    }, []);

    const handleShowChat = () => {
        setShowChatContainer(true);
    }

    const currentUser = {
        teamId: teamId,
        name: userDetails.email.split('@')[0],
        userId: userDetails.id
    };

    const handleSend = (textContent) => {
        const messageData = {
            teamId: currentUser.teamId,
            name: currentUser.name,
            userId: currentUser.userId,
            message: textContent,
            action: "sendMessage"
        };

        socketRef.current.send(JSON.stringify(messageData));
    }

    const handleClose = () => {
        const closeData = {
            teamId: currentUser.teamId,
            name: currentUser.name,
            userId: currentUser.userId,
            action: "setStatus"
        };
        socketRef.current.send(JSON.stringify(closeData));
        setShowChatContainer(false);
    }

    return (
        <div>
            <div
                className="chat-icon bg-primary rounded-circle text-white d-flex align-items-center justify-content-center"
                style={{
                    position: 'fixed',
                    bottom: '40px',
                    right: '120px',
                    width: '60px',
                    height: '60px',
                    cursor: 'pointer',
                }}
                onClick={handleShowChat}
            >
                <FontAwesomeIcon icon={faComment} />
            </div>
            <Offcanvas show={showChatContainer} onHide={handleClose} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Live Chat</Offcanvas.Title>
                </Offcanvas.Header>
                <div style={{ overflowY: "hidden", height: "100%" }}>
                    <ChatContainer>
                        <MessageList>
                            {messages.length !== 0 && messages.map((message, index) =>
                                <div key={index}>
                                    <p style={{
                                        paddingBottom: "0px",
                                        marginBottom: "0px", fontSize: "small",
                                        textAlignLast: message.name !== currentUser.name ? "end" : "auto"
                                    }}>
                                        {message.name}
                                    </p>
                                    <Message model={{
                                        message: message.message,
                                        sentTime: "just now",
                                        sender: "Joe",
                                        direction: (message.name === currentUser.name) ? "incoming" : "outgoing"
                                    }} style={{ color: "red" }} >
                                        {/* <Message.Header sender={message.name} /> */}
                                    </Message>
                                </div>
                            )}
                        </MessageList>
                        <MessageInput placeholder="Type message here" attachButton={false} onSend={handleSend} />
                    </ChatContainer>
                </div>
            </Offcanvas>
        </div>
    );
}

export default Chat;