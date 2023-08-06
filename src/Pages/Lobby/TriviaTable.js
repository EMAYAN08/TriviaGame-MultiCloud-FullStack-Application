import React, { useEffect, useState } from 'react';
import axios from 'axios';
import backgroundWallpaper from './bg.jpeg';
import StyledBadge from './StyledBadge';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead.bs5.css';
import { Button, Text } from '@nextui-org/react';
import { Collapse } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { styled } from "@mui/system";
import './TriviaTable.css';
import Header from "../../Components/Header/Header";
import { useNavigate } from 'react-router-dom';
import InGame from '../InGame/InGame'

const DialogStyled = styled(Dialog)(({ theme }) => ({
  textAlign: 'center',
  color: 'navy',
  '& .MuiDialog-paper': {
    padding: '20px',
    borderRadius: '15px',
  },
  '& .MuiDialogTitle-root': {
    marginBottom: '20px',
    fontWeight: 'bold',
  },
  '& .MuiDialogContentText-root': {
    marginBottom: '20px',
  },
  '& .MuiFormControl-root': {
    minWidth: '100%',
  },
  '& .MuiButton-root': {
    margin: '10px',
    borderRadius: '20px',
  },
}));

const userDetails = JSON.parse(localStorage.getItem('userDetails'));
console.log("USER DETAILS:", userDetails);

function TriviaTable() {
  const [backupData, setBackupData] = useState([]);
  const [data, setData] = useState([]);
  const [multiSelectionsCategory, setMultiSelectionsCategory] = useState([]);
  const [multiSelectionsDifficulty, setMultiSelectionsDifficulty] = useState([]);
  const [multiSelectionsTime, setMultiSelectionsTime] = useState([]);
  const [optionsCategory, setOptionsCategory] = useState([]);
  const [optionsDifficulty, setOptionsDifficulty] = useState([]);
  const [optionsTime, setOptionsTime] = useState([]);
  const [open, setOpen] = useState(-1);
  const [timers, setTimers] = useState([]);
  const [userTeams, setUserTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageDialogContent, setMessageDialogContent] = useState('');
  const [gameToJoin, setGameToJoin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          'https://2ta7t7duj3.execute-api.ca-central-1.amazonaws.com/dev'
        );
        console.log("TYPE OF RESPONSE: ",typeof response.data.body);
        const categories = response.data.body;
        setOptionsCategory(categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchTriviaGames = async () => {
      try {
        const response = await axios.post(
          'https://7wldkmbyq5.execute-api.ca-central-1.amazonaws.com/dev',
          {test: ''}
        );
        const games = response.data.body;
        setData(games);
        setBackupData(games);
        allocatingOptions(games);
      } catch (error) {
        console.error('Error fetching trivia games:', error);
      }
    };

    fetchCategories();
    fetchTriviaGames();
  }, []);

  useEffect(() => {
    const storedTimers = JSON.parse(localStorage.getItem('countdownTimers'));
    if (storedTimers && storedTimers.length === data.length) {
      setTimers(storedTimers);
    } else {
      const countdownTimers = data.map((item) => item.duration * 60);
      setTimers(countdownTimers);
    }

    const interval = setInterval(() => {
      setTimers((prevTimers) =>
        prevTimers.map((timer) => (timer > 0 ? timer - 1 : 0))
      );
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [data]);

  useEffect(() => {
    if (timers.length !== 0) {
      localStorage.setItem('countdownTimers', JSON.stringify(timers));
    }
  }, [timers]);

  function allocatingOptions(games) {
    const uniqueDifficulties = Array.from(
      new Set(games.map((item) => item.difficultyLevel))
    );
    const uniqueTimes = Array.from(new Set(games.map((item) => item.duration)));

    const timeOptions = uniqueTimes.map((time) => ({
      name: `${time} min`,
      value: time,
    }));

    setOptionsDifficulty(uniqueDifficulties);
    setOptionsTime(timeOptions);
  }

  async function handleFilter() {
    try {
      const filters = {
        categoryId: multiSelectionsCategory[0]?.id,
        difficultyLevel: multiSelectionsDifficulty[0],
        duration: multiSelectionsTime[0]?.value,
      };
  
      const response = await axios.post(
        'https://7wldkmbyq5.execute-api.ca-central-1.amazonaws.com/dev',
        filters
      );
  
      const filteredData = response.data.body;
      setData(filteredData);
      if (filteredData.length === 0) {
        setData(backupData);
      }
    } catch (error) {
      console.error('Error fetching filtered trivia games:', error);
    }
  }

  function getTimeLeft(startTime) {
    const now = new Date();
    const gameStartTime = new Date(startTime);
    const timeDifference = gameStartTime - now;

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    return `${days} d: ${hours} h: ${minutes} m: ${seconds} s`;
  }

  async function fetchTeamsByUserId() {
    try {
      // const response = await axios.post(
      //   'https://jeq373bco1.execute-api.us-east-1.amazonaws.com/dev',
      //   { user_id: 'preethamkachhadiya@gmail.com' }
      // );
      const response = await axios.post(
        'https://dqod94jn34.execute-api.us-east-1.amazonaws.com/dev/get_all_teams_by_userid',
        { user_id: userDetails.id }
      );
      console.log("this is the teams for the user: ", response);
      const teams = response.data.body;
      setUserTeams(teams);
    } catch (error) {
      console.error('Error fetching user teams:', error);
    }
  }

  useEffect(() => {
    fetchTeamsByUserId();
  }, []);

  function hasTeamJoinedGame(gameID, teamID) {
    const game = data.find((item) => item.id === gameID);
    if (game && game.participants.includes(teamID)) {
      return true;
    }
    return false;
  }

  async function handleJoinGame(gameID) {
    setGameToJoin(gameID);
    if (userTeams.length > 1) {
      setSelectedTeam('');
      setOpenDialog(true);
    } else if (userTeams.length === 1) {
      if (userTeams[0].TeamID && gameID) {
        await joinGame(userTeams[0].TeamID, gameID);
      } else {
        console.error('Invalid teamID or gameID.');
      }
    } else {
      console.error('User is not in any team.');
    }
  }
  
  async function handleDialogJoinGame() {
    if (selectedTeam && gameToJoin) {
      setOpenDialog(false);
      await joinGame(selectedTeam, gameToJoin);
    } else {
      console.error('No team selected or invalid gameID.');
    }
  }
  

  async function joinGame(teamID, gameID) {
    try {
      const teamIDString = teamID.toString();
      const gameIDString = gameID.toString();
  
      const hasJoined = hasTeamJoinedGame(gameID, teamIDString);
  
      console.log("teamID and gameID before updating or joining game: ", teamIDString, gameIDString);
  
      if (hasJoined) {
        setMessageDialogContent('Your team has already joined the game.');
        await fetchTeamMembersAndSendNotifications(teamIDString, gameIDString);
        setMessageDialogOpen(true);
        return;
      }
  
      const response = await axios.put('https://2jq1vuzmp3.execute-api.ca-central-1.amazonaws.com/dev', {
        gameId: gameIDString, 
        updateData: {
          participants: [teamIDString], 
        },
      });
      console.log("this is the response from drhuvil's API: ", response);
  
      const responseBody = response.data.body;
      if (responseBody.message === 'success') {
        setMessageDialogContent('Successfully Joined the Game!');
        await fetchTeamMembersAndSendNotifications(teamIDString, gameIDString);
      } else {
        setMessageDialogContent('Error joining the game.');
      }
  
      setMessageDialogOpen(true);
    } catch (error) {
      setMessageDialogContent('Error joining the game: ' + error.message);
      setMessageDialogOpen(true);
    }
  }
  
  async function fetchTeamMembersAndSendNotifications(teamID, gameID) {
    try {
      const response = await axios.post(
        'https://zldppvwzlk.execute-api.us-east-1.amazonaws.com/dev/get_team_by_teamid',
        { TeamID: teamID }
      );
      const team = response.data.body;
      const emailList = team.team_members.map(member => member.email);
  
      // Fetch the game name
      const game = data.find((game) => game.id === gameID);
      const gameName = game ? game.name : '';
  
      await sendEmailNotifications(emailList, gameID, team.team_name, gameName);
    } catch (error) {
      console.error('Error fetching team members or sending notifications:', error);
    }
  }
  
  async function sendEmailNotifications(emailList, gameID, teamName, gameName) {
    try {
      const response = await axios.post(
        'https://479wpnc4oa.execute-api.us-east-1.amazonaws.com/dev/send_notification_email',
        {
          send_to: 'some',
          email_list: emailList,
          email_subject: 'Game Join Notification',
          // Include the team name and game name in the email body
          email_body: `Hello Team - ${teamName}!!! \nOne of your team members has already registered for the game ${gameName} successfully. \nSo, wait for the game to begin! Enjoy your game.`
        }
      );
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  }
  

  const handleCloseMessageDialog = () => {
    setMessageDialogOpen(false);
  };

  function canStartGame(gameStartTime) {
    const currentTime = new Date();
    const timeDifference = new Date(gameStartTime) - currentTime;
    return timeDifference <= 100000; // 100 seconds in milliseconds
  }

  async function handleStartGame(userID, teamID, gameID, gameStartTime) {
    if (canStartGame(gameStartTime)) {
      navigate('/ingame', {
        state:{
          userID, teamID, gameID
        }
      })
    } 
    else {
      console.log('Cannot start the game yet. Please wait until 20 seconds before the start time.');
    }
  }


  return (
    <>
    <Header />
    <div className="trivia-table-container">
      <div
        className="background-image"
        style={{ backgroundImage: `url(${backgroundWallpaper})` }}
      ></div>
      <div className="center-container">
        <Text
          h1
          size={60}
          css={{ textGradient: '45deg, $blue600 -20%, $red500 50%' }}
          weight="bold"
          className="title"
        >
          Trivia Game Lobby
        </Text>
        <p className="subtitle">Test your knowledge and enjoy the fun game experience!</p>
        <div className="filter-container">
          <Typeahead
            id="typeahead-category"
            labelKey="name"
            options={optionsCategory}
            onChange={setMultiSelectionsCategory}
            placeholder="Choose Category...."
            selected={multiSelectionsCategory}
            className="filter-typeahead"
          />
          <Typeahead
            id="typeahead-difficulty"
            labelKey="name"
            options={optionsDifficulty}
            onChange={setMultiSelectionsDifficulty}
            placeholder="Choose Difficulty...."
            selected={multiSelectionsDifficulty}
            className="filter-typeahead"
          />
          <Typeahead
            id="typeahead-time"
            labelKey="name"
            options={optionsTime}
            onChange={setMultiSelectionsTime}
            placeholder="Choose Time...."
            selected={multiSelectionsTime}
            className="filter-typeahead"
          />
          <Button
            color="gradient"
            auto
            className="filter-button"
            onClick={handleFilter}
          >
            Filter
          </Button>
        </div>
        <div className="games-grid">
          {data.filter(item => {
            const timeDifference = new Date(item.startTime) - new Date();
            return !isNaN(timeDifference) && timeDifference > 0;
          }).map((item, index) => (
            <div key={index} className="game-card">
              <div className="card-header">
                <IconButton onClick={() => setOpen(open === index ? -1 : index)}>
                  {open === index ? (
                    <KeyboardArrowUpIcon style={{ fill: 'red' }} />
                  ) : (
                    <KeyboardArrowDownIcon style={{ fill: 'red' }} />
                  )}
                </IconButton>
              </div>
              <div className="card-body">
                <div className="game-info">
                  <div className="game-title">{item.name}</div>
                  <div className="game-category">{item.category}</div>
                  <div className="game-difficulty">
                    <StyledBadge type={item.difficultyLevel.toLowerCase()}>
                      {item.difficultyLevel}
                    </StyledBadge>
                  </div>
                  <div className="game-time">{item.duration} min</div>
                </div>
                <div className="game-start-time">
                  Begins in: {getTimeLeft(item.startTime)}
                </div>
                <div className="game-description">
                  <Collapse in={open === index} unmountOnExit>
                    <Box className="description-box">
                      <Typography>{item.description}</Typography>
                    </Box>
                  </Collapse>
                </div>
              </div>
              <div className="card-footer">
              <Button
                ghost
                color="gradient"
                auto
                onPress={() => handleJoinGame(item.id)}
              >
                Join the Game
              </Button>

              <Button
                ghost
                color={canStartGame(item.startTime) ? "success" : "secondary"}
                auto
                disabled={!canStartGame(item.startTime)}
                onClick={() => handleStartGame(userDetails.email, userTeams[0].TeamID, item.id, item.startTime)}
              >
                Start Game
              </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <DialogStyled open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Select a Team</DialogTitle>
        <DialogContent>
          <DialogContentText>
            In which team do you want to register for this game?
          </DialogContentText>
          <FormControl>
            <InputLabel>Team</InputLabel>
            <Select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
            >
              {userTeams.map((team) => (
                <MenuItem key={team.TeamID} value={team.TeamID}>
                  {team.team_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDialogJoinGame} color="primary">
            Join Game
          </Button>
        </DialogActions>
      </DialogStyled>

      <DialogStyled open={messageDialogOpen} onClose={handleCloseMessageDialog}>
        <DialogTitle>Message</DialogTitle>
        <DialogContent>
          <DialogContentText>{messageDialogContent}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMessageDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </DialogStyled>

    </div></>
  );
}

export default TriviaTable;
