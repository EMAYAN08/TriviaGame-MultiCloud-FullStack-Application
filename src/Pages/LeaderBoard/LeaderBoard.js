import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead.bs5.css';
import './LeaderBoard.css';
import { ResponsiveContainer,BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import Header from "../../Components/Header/Header";
// Import Font Awesome icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy } from '@fortawesome/free-solid-svg-icons';

function TeamChart({ data }) {
  // Prepare data for the chart
  const chartData = data.map((team) => ({
    name: 'team'+team.id.slice(0,2),
    score: team.totalScore,
    games: team.gamesPlayed,
    avgScore: team.winLossRatio.toFixed(2),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="score" fill="#8884d8" />
        <Bar dataKey="games" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function UserChart({ data }) {
  // Prepare data for the chart
  const chartData = data.map((user) => ({
    name: 'user'+user.id.slice(0,2),
    score: user.totalScore,
    games: user.gamesPlayed,
    avgScore: user.winLossRatio.toFixed(2),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="score" fill="#8884d8" />
        <Bar dataKey="games" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function Leaderboard() {
  const [games, setGames] = useState([]);
  const [leaderboardMode, setLeaderboardMode] = useState('team'); // Default mode is 'team'
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGameName, setSelectedGameName] = useState('');
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('all'); // Default time frame is 'all'

  useEffect(() => {
    fetchLeaderboardData('team'); // Fetch team scores by default
  }, []);

  const fetchLeaderboardData = async (mode) => {
    try {
      const response = await axios.get('https://94gymv1l15.execute-api.ca-central-1.amazonaws.com/dev');
      const gamesData = response.data.body;
      setGames(gamesData);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    }
  };

  const filterScoresByCategory = (data) => {
    if (!selectedCategory) {
      return data; // If no category is selected, return all data
    }
    return data.filter((game) => game.Game_category === selectedCategory);
  };

  const filterScoresByGameName = (data) => {
    if (!selectedGameName) {
      return data; // If no game name is selected, return all data
    }
    return data.filter((game) => game.Game_name === selectedGameName);
  };

  const filterScoresByTimeFrame = (data) => {
    if (selectedTimeFrame === 'all') {
      return data; // If 'all' is selected, return all data
    }

    const currentTime = Date.now();
    const timeFrameInMilliseconds = {
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000,
    };

    return data.filter((game) => {
      const createdAt = new Date(game.createdAt).getTime();
      return currentTime - createdAt <= timeFrameInMilliseconds[selectedTimeFrame];
    });
  };

  const handleFilterButtonClick = () => {
    fetchLeaderboardData(leaderboardMode);
  };

  const calculateLeaderboardData = (leaderboardData) => {
    const filteredData = filterScoresByGameName(
      filterScoresByCategory(filterScoresByTimeFrame(leaderboardData))
    );

    const leaderboard = {};

    filteredData.forEach((game) => {
      const participants = game.participants || [];
      const scores =
        leaderboardMode === 'team' ? game.Team_points_earned : game.User_points_earned;

      participants.forEach((participant) => {
        if (!leaderboard[participant]) {
          leaderboard[participant] = {
            totalScore: 0,
            gamesPlayed: 0,
            winLossRatio: 0,
          };
        }
      });

      scores.forEach((score) => {
        const id = leaderboardMode === 'team' ? score.teamID : score.userID;
        const scoreValue = leaderboardMode === 'team' ? score.teamScore : score.userScore;

        if (leaderboard[id]) {
          leaderboard[id].totalScore += Number(scoreValue);
          leaderboard[id].gamesPlayed += 1;
          leaderboard[id].winLossRatio =
            leaderboard[id].totalScore / leaderboard[id].gamesPlayed;
        } else {
          leaderboard[id] = {
            totalScore: Number(scoreValue),
            gamesPlayed: 1,
            winLossRatio: Number(scoreValue),
          };
        }
      });
    });

    const leaderboardArray = Object.keys(leaderboard).map((id) => ({
      id,
      ...leaderboard[id],
    }));

    return leaderboardArray.sort((a, b) => b.totalScore - a.totalScore);
  };

  const renderLeaderboardTable = (leaderboardData) => {
    const leaderboardArray = calculateLeaderboardData(leaderboardData);

    return (
      
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>{leaderboardMode === 'team' ? 'Team' : 'User'} ID</th>
            <th>Total Score</th>
            <th>Games Played</th>
            <th>Average Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardArray.map((entry, index) => (
            <tr key={entry.id}>
              <td>
                {index === 0 ? (
                  <FontAwesomeIcon className="gold-badge-icon" icon={faTrophy} />
                ) : index === 1 ? (
                  <FontAwesomeIcon className="silver-badge-icon" icon={faTrophy} />
                ) : index === 2 ? (
                  <FontAwesomeIcon className="bronze-badge-icon" icon={faTrophy} />
                ) : null}
                {leaderboardMode==='team'? 'team'+entry.id.slice(0,2) : 'user'+entry.id.slice(0,2)}
              </td>
              <td>{entry.totalScore}</td>
              <td>{entry.gamesPlayed}</td>
              <td>{entry.winLossRatio.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const categories = [...new Set(games.map((game) => game.Game_category))];
  const gameNames = [...new Set(games.map((game) => game.Game_name))];
  const leaderboardData = calculateLeaderboardData(games);
  return (
    <>
    <Header />
    <div className="leaderboard-container">
      <h1 className="leaderboard-title">Trivia Game Leaderboard</h1>
      <div className="leaderboard-filters">
        <div className="filter-category">
          <label className="filter-label">Category:</label>
          <Typeahead
            id="typeahead-category"
            options={categories}
            onChange={(selected) => setSelectedCategory(selected[0] || '')}
            placeholder="Select a category..."
            selected={selectedCategory ? [selectedCategory] : []}
          />
        </div>
        <div className="filter-game-name">
          <label className="filter-label">Game Name:</label>
          <Typeahead
            id="typeahead-game-name"
            options={gameNames}
            onChange={(selected) => setSelectedGameName(selected[0] || '')}
            placeholder="Select a game..."
            selected={selectedGameName ? [selectedGameName] : []}
          />
        </div>
        <div className="filter-time-frame">
          <label className="filter-label">Time Frame:</label>
          <select
            value={selectedTimeFrame}
            onChange={(e) => setSelectedTimeFrame(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <button className="filter-button" onClick={handleFilterButtonClick}>
          Filter
        </button>
      </div>
      <div className="leaderboard-mode-switch">
        <button
          className={`leaderboard-mode-button ${leaderboardMode === 'team' ? 'active' : ''}`}
          onClick={() => {
            setLeaderboardMode('team');
            fetchLeaderboardData('team');
          }}
        >
          Team Leaderboard
        </button>
        <button
          className={`leaderboard-mode-button ${leaderboardMode === 'user' ? 'active' : ''}`}
          onClick={() => {
            setLeaderboardMode('user');
            fetchLeaderboardData('user');
          }}
        >
          User Leaderboard
        </button>
      </div>
      <div className="leaderboard">
        <h2 className="leaderboard-title">
          {leaderboardMode === 'team' ? 'Team Leaderboard' : 'User Leaderboard'}
        </h2>
        {leaderboardMode === 'team' ? (
          <TeamChart data={leaderboardData} />
        ) : (
          <UserChart data={leaderboardData} />
        )}
        {renderLeaderboardTable(games)}
      </div>
    </div>
    </>
  );
}

export default Leaderboard;