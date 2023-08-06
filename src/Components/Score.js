import React, { useEffect, useState, useRef } from "react";
// import styles from '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
// import { ChatContainer, MessageList, Message, MessageInput } from '@chatscope/chat-ui-kit-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Offcanvas, Table } from 'react-bootstrap';
import "../Css/Score.css";
import { scoreSocket } from "../constants/constants";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartSimple } from '@fortawesome/free-solid-svg-icons';

function Score() {
    const [showChatContainer, setShowChatContainer] = useState(false);
    const [teams, setTeams] = useState([]);
    let socketRef = useRef(null);

    const handleShowChat = () => {
        setShowChatContainer(true);
    }

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = new WebSocket(scoreSocket);

            socketRef.current.onopen = () => {
                console.log('WebSocket connection established.');
            };

            socketRef.current.onmessage = (event) => {
                const message = JSON.parse(event.data);
                handleMessage(message);
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
        };
    }, []);

    const handleMessage = (message) => {
        const incomingTeam = {
            team_id: message.team_id,
            current_score: message.current_score
        };
        setTeams((prevValue) => {
            const ifTeamExists = prevValue.findIndex((team) => team.team_id === incomingTeam.team_id);
            if (ifTeamExists !== -1) {
                const newTeams = [...prevValue];
                newTeams[ifTeamExists].current_score = incomingTeam.current_score;
                return newTeams;
            } else {
                return [...prevValue, incomingTeam];
            }
        });
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
                    right: '200px',
                    width: '60px',
                    height: '60px',
                    cursor: 'pointer',
                }}
                onClick={handleShowChat}
            >
                <FontAwesomeIcon icon={faChartSimple} />
            </div>
            <Offcanvas show={showChatContainer} onHide={handleClose} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Live Scores</Offcanvas.Title>
                </Offcanvas.Header>
                <div className="score-table">
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Team Name</th>
                                <th>Team Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                teams.length !== 0 && teams.map((team, index) =>
                                    <tr key={index}>
                                        <td>{team.team_id}</td>
                                        <td>{team.current_score}</td>
                                    </tr>
                                )}
                        </tbody>
                    </Table>
                </div>
            </Offcanvas>
        </div>
    )
};

export default Score;