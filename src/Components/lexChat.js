import React, { useEffect, useRef, useState } from "react";
import styles from '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { ChatContainer, MessageList, Message, MessageInput } from '@chatscope/chat-ui-kit-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Offcanvas } from 'react-bootstrap';
import { lexSocket } from "../constants/constants"; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';

function LexChat() {
    const [showChatContainer, setShowChatContainer] = useState(false);
    const [messages, setMessages] = useState([{}]);
    let socketRef = useRef(null);

    const handleShowChat = () => {
        setShowChatContainer(true);
    }

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = new WebSocket(lexSocket);

            socketRef.current.onopen = () => {
                console.log('WebSocket connection established.');
            };

            socketRef.current.onmessage = (event) => {
                const message = JSON.parse(event.data);
                const incomingMessage = {
                    message: message.message,
                    direction: "incoming"
                }
                if(incomingMessage.message.includes('|')) {
                    const msg = incomingMessage.message.split("|");
                    incomingMessage.message = `${msg[0]}:<a href="${msg[1].trim()}">${msg[1].trim()}</a>`
                }
                setMessages((prevValue) => [...prevValue, incomingMessage]);
            };

            socketRef.current.onclose = (event) => {
                if (event.wasClean) {
                    console.log("closed cleanely");
                } else {
                    console.log("not");
                }
                console.log('WebSocket connection closed:', event.code, event.reason);
            };

            socketRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        }

        return () => {
            // if(socketRef.current) {
            socketRef.current.close();
            // }
        };
    }, []);

    const handleSend = (textContent) => {
        const message = {
            message: textContent,
            direction: "outgoing"
        };

        setMessages((prevValue) => [...prevValue, message]);

        const messageData = {
            prompt: textContent,
            action: "sendLexResponse"
        };

        socketRef.current.send(JSON.stringify(messageData));
    }

    const handleClose = () => {
        setShowChatContainer(false);
    }

    return (
        <div>
            <div
                className="chat-icon bg-primary rounded-circle text-white d-flex align-items-center justify-content-center"
                style={{
                    position: 'fixed',
                    bottom: '40px',
                    right: '40px',
                    width: '60px',
                    height: '60px',
                    cursor: 'pointer',
                }}
                onClick={handleShowChat}
            >
                <FontAwesomeIcon icon={faRobot} />
            </div>
            <Offcanvas show={showChatContainer} onHide={handleClose} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Ask</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <div style={{ overflowY: "hidden", height: "100%" }}>
                        <ChatContainer>
                            <MessageList>
                                {messages.length !== 0 && messages.map((message, index) =>
                                    (
                                        Object.keys(message).length !== 0) &&
                                    (
                                        <Message
                                            key={index}
                                            model={{
                                                type: "html",
                                                direction: message.direction
                                            }}
                                        >
                                            {/* <Message.Header sender={message.name} /> */}
                                            <Message.HtmlContent html={message.message}/>
                                        </Message>
                                    )
                                )}
                            </MessageList>
                            <MessageInput placeholder="Type message here" attachButton={false} onSend={handleSend} />
                        </ChatContainer>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </div>
    )
};

export default LexChat;