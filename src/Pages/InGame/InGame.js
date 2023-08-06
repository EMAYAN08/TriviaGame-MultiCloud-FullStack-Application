import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import './style.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import Chat from '../../Components/Chat';
import Score from '../../Components/Score';
import 'react-toastify/dist/ReactToastify.css';

function InGame() {
  const userDetails = JSON.parse(localStorage.getItem('userDetails'));
  const [joinStatus, setJoinStatus] = useState(false);
  const [liveGameId, setLiveGameId] = useState("i2DrS2CKkKpGsDGh1KUx");
  const [questionEvents, setQuestionEvents] = useState([]);
  const [answerEvents, setAnswerEvents] = useState([]);
  const [gameStatus, setGameStatus] = useState(null);
  const [startTimer, setTimerStatus] = useState(false);
  const [initialSeconds, setInitialSeconds] = useState(0);
  const [currentQuestionNumber, setCurrentQuestionnumber] = useState("0");
  const [currentTeamName, setCurrentTeamName] = useState("");

  const location = useLocation()
  const teamId = location.state.teamID;
  const gameID = location.state.gameID;
  const userId = userDetails.id;

  const iframeStyle = {
    width: '100%',
    height: '500px',
    border: 'none',
  };

  function disableJoinStatus() {
    setJoinStatus(false);
  }
  useEffect(() => {
    setLiveGameId(gameID);
    getTeamById();
  }, [])

  function getTeamById() {
    axios
      .post("https://zldppvwzlk.execute-api.us-east-1.amazonaws.com/dev/get_team_by_teamid", {
        TeamID: teamId
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((res) => {
        setCurrentTeamName(res.data.body.team_name);
      })
      .catch((err) => {
        console.log("Error getting team name by id", err);
      })
  }

  function toggleJoinStatus() {
    setJoinStatus(!joinStatus);
    if (!joinStatus) {
      setQuestionEvents([])
      setAnswerEvents([])
    }
    else {
      setGameStatus("Waiting for Game to start will start soon")
    }
  }

  function updateState(newQuestion) {
    setTimerStatus(true)
    setQuestionEvents([...questionEvents, newQuestion]);
  }

  function updateAnswerState(newAnswer) {
    setAnswerEvents([...answerEvents, newAnswer]);
  }

  function UpdateGameStatus(newMessage) {
    setGameStatus(newMessage)
  }

  function CallFromTimer() {
    setTimerStatus(false)
  }

  const handleHint = () => {
    const url = "https://milxhgmyj6.execute-api.us-east-1.amazonaws.com/prod/gethint";
    const question = {
      trivia_game_id: gameID,
      question_number: currentQuestionNumber
    };
    axios
      .post(url, question, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((res) => {
        toast.info(res.data.body);
      })
      .catch((err) => {
        console.log("Error getting hint", err);
      })
  }

  const updateStateCallback = useCallback(updateState, []);
  const updateAnswerStateCallback = useCallback(updateAnswerState, []);

  function submitAnswer(questionId, answerList) {
    console.log("answer submitted to backend", liveGameId);
    axios
      .post('https://milxhgmyj6.execute-api.us-east-1.amazonaws.com/prod', {
        gameId: liveGameId,
        teamId: teamId,
        questionNumber: questionId,
        userId: userId,
        answer: answerList,
        teamName: currentTeamName
      })
      .then((response) => {
        // Handle the API response if needed
        setTimerStatus(false)
        console.log('API Response:', response.data);
      })
      .catch((error) => {
        // Handle API error if needed
        setTimerStatus(false)
        console.error('API Error:', error);
      });
  }

  useEffect(() => {
    //const url = "http://127.0.0.1:8080/PushQuestions/";
    const url = "https://livegamequestionpusher-cf4azy4lca-uc.a.run.app/PushQuestions/";


    if (joinStatus) {
      const eventSource = new EventSource(url + liveGameId);

      eventSource.onmessage = (event) => {
        const eventData = event.data;
        const eventDataJson = JSON.parse(eventData);
        console.log("event data Json ", eventDataJson);
        setTimerStatus(false)
        if (eventDataJson['status'] === 0) {
          console.log("error Game not started ", eventDataJson["status"]);
          eventSource.close();
          UpdateGameStatus(eventDataJson["message"]);
          disableJoinStatus();
        } else if (eventDataJson['status'] === 5) {
          console.log("Game Already Over message ", eventDataJson["status"]);
          UpdateGameStatus(eventDataJson["message"]);
          disableJoinStatus();
          setTimerStatus(false)
          eventSource.close();
        }
        else if (eventDataJson['status'] === 6) {
          console.log("timer branch active")
          UpdateGameStatus(eventDataJson["message"])
          setInitialSeconds(eventDataJson['time_counter'])
          setTimerStatus(true)
        }
        else if (eventDataJson["status"] === 2) {
          UpdateGameStatus(eventDataJson["message"]);
          let answerInfo = eventDataJson['private_info'];
          let answerJson = JSON.parse(answerInfo);
          setTimerStatus(false)
          updateState([])
          updateAnswerState(answerJson);
          disableJoinStatus();
          eventSource.close();
        } else if (eventDataJson["status"] === 1) {
          console.log("Test rerender");
          UpdateGameStatus("Game in Progress");
          let payload = eventDataJson['payload'];
          const questionJson = JSON.parse(payload[0]);
          updateState(questionJson);
          setCurrentQuestionnumber(questionJson.question_number);
          let answerJson = null;

          answerJson = JSON.parse(payload[1]);
          if (answerJson) {
            updateAnswerState(answerJson);
          }
          setTimerStatus(false)
          setInitialSeconds(20)
          setTimerStatus(true)


        } else {
          console.log("Unknown Error happened In Front End");
          eventSource.close();
          UpdateGameStatus(eventDataJson["message"]);
          disableJoinStatus();
        }
      };

      eventSource.onerror = (error) => {
        console.log('Error:', error);
        UpdateGameStatus("Unknown Error");
        eventSource.close();
        disableJoinStatus();
      };

      return () => {
        console.log("Event closed")
        eventSource.close();
      };
    }
  }, [joinStatus, updateStateCallback, updateAnswerStateCallback]);

  const questionList = questionEvents.length > 0 ? questionEvents[questionEvents.length - 1] : null;
  const privateInfo = answerEvents.length > 0 ? answerEvents[answerEvents.length - 1] : null;

  return (
    <div className='app-container'>
      <button onClick={() => toggleJoinStatus()} className='join-button'>
        {joinStatus ? (
          <p>Currently In a Trivia Game</p>
        ) : (
          <p>Join Trivia Game</p>
        )}
      </button>
      <Chat teamId={teamId} />
      <Score />
      <div
        className="chat-icon bg-primary text-white d-flex align-items-center justify-content-center"
        style={{
          position: 'fixed',
          bottom: '40px',
          right: '280px',
          borderRadius: '24px',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: '0.5rem'
        }}
        onClick={handleHint}
      >
        Request Hint
      </div>
      <LiveTrivia
        questionList={questionList}
        privateInfo={privateInfo}
        submitAnswer={submitAnswer}
      />

      {gameStatus && (
        <GameStatusContainer gameStatusMessage={gameStatus} />
      )}

      {startTimer && initialSeconds && (<Timer startTimer={startTimer} initialSeconds={initialSeconds} callParent={CallFromTimer} />)}
      <ToastContainer />
      <div>
        <iframe width="600" height="450" src="https://lookerstudio.google.com/embed/reporting/fcc7f238-4f8d-4485-838d-39f5f0398dee/page/aJpYD" frameborder="0" style={iframeStyle} allowfullscreen></iframe>
      </div>
    </div>
  );
}


const Timer = ({ startTimer, initialSeconds, callParent }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    let timerId;
    if (startTimer && seconds > 0) {
      timerId = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);
    }

    return () => {
      clearInterval(timerId);
    };
  }, [startTimer, seconds]);

  useEffect(() => {
    // Reset the timer if initialSeconds changes while the timer is not running
    if (!startTimer) {
      setSeconds(initialSeconds);
    }
  }, [startTimer, initialSeconds]);

  useEffect(() => {
    // Check if time reaches zero and unmount the component
    if (seconds === 0) {
      callParent()
    }
  }, [seconds, callParent]);

  const handleButtonClick = () => {
    // Add your button click logic here
    console.log('Button clicked!');
  };

  return (
    <div>
      <h2>Time Remaining: {seconds} seconds</h2>
    </div>
  );
};

function LiveTrivia({ questionList, privateInfo, submitAnswer }) {

  const [responseMessage, setResponseMessage] = useState(null);

  function updateResponseMessage(questionNumber, selectedAnswers) {
    let message = "Answer submitted for question " + questionNumber + " ."
    setResponseMessage(message)
  }

  function handleSubmitAnswer(selectedAnswers) {
    // Here you can handle submitting the selected answer to your backend or do any additional logic
    console.log("selected answer is", selectedAnswers);
    console.log("question number is ", questionList["question_number"]);
    submitAnswer(questionList["question_number"], selectedAnswers);
    updateResponseMessage(questionList['question_number'], selectedAnswers);
  }


  return (
    <div className='trivia-container'>
      {questionList ? (
        <QuestionCollection
          question={questionList["question_content"]}
          answerContentList={questionList["answers"]}
          privateInfo={privateInfo}
          handleSubmitAnswer={handleSubmitAnswer}
        />
      ) : (
        <QuestionCollection
          question={null}
          answerContentList={null}
          privateInfo={privateInfo}
          handleSubmitAnswer={null}
        />
      )}

      {questionList && responseMessage && (
        <ResponseStatusContainer responseStatusMessage={responseMessage} />
      )}

    </div>
  );
}

function QuestionCollection({ question, answerContentList, privateInfo, handleSubmitAnswer }) {
  const [submitStatus, setSubmitStatus] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState([]);

  function submitAnswer() {
    if (!submitStatus) {
      setSubmitStatus(true);
      handleSubmitAnswer(selectedAnswers);
    }
  }

  function handleAnswerSelection(answerNumber, isChecked) {
    setSelectedAnswers((prevSelectedAnswers) =>
      isChecked
        ? [...prevSelectedAnswers, answerNumber]
        : prevSelectedAnswers.filter((selectedAnswer) => selectedAnswer !== answerNumber)
    );
  }

  useEffect(() => {
    setSubmitStatus(false);
    setSelectedAnswers([]);
  }, [question]);

  return (

    <div>
      {question && (
        <div className='question'>
          <Question questionContent={question} />
          {answerContentList.map((answerContent) => (
            <div key={answerContent.answer_number}>
              <label>
                <input
                  type="checkbox"
                  value={answerContent.answer_number}
                  checked={selectedAnswers.includes(answerContent.answer_number)}
                  onChange={(e) => handleAnswerSelection(answerContent.answer_number, e.target.checked)}
                />
                <Answer answerContent={answerContent.answer_content} />
              </label>
            </div>
          ))}
          <button onClick={submitAnswer}>Submit Answer</button>
        </div>
      )}
      <div>
        {privateInfo && <PreviousAnswer privateInfo={privateInfo} />}
      </div>
    </div>
  )
}

function Question({ questionContent }) {
  return <div>{questionContent}</div>;
}

function PreviousAnswer({ privateInfo }) {
  if (!privateInfo) {
    return null;
  }

  const correctAnswers = privateInfo['correct_answers'];
  const explanation = privateInfo['question_explanation'];

  return (
    <div className="previous-answer-container">
      <h2>Previous Answer</h2>
      <div className="correct-answer">
        <p>Correct Answer:</p>
        <ul>
          {correctAnswers.map((answer, index) => (
            <li key={index}>{answer}</li>
          ))}
        </ul>
      </div>
      <div className="explanation">
        <p>Explanation:</p>
        <p>{explanation}</p>
      </div>
    </div>
  );
}


function GameStatusContainer({ gameStatusMessage }) {
  if (!gameStatusMessage) {
    return <div className='answer-option'> Waiting for Game To Start</div>;
  }
  return <div className='answer-option'>{gameStatusMessage}</div>;
}

function ResponseStatusContainer({ responseStatusMessage }) {
  if (!responseStatusMessage) {
    return null
  }
  return <div className='answer-option'>{responseStatusMessage}</div>;
}




function Answer({ answerContent }) {
  return <div className='answer-option'>{answerContent}</div>;
}

export default InGame;
