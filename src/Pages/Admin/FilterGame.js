import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../Css/admin.css';
import Header from './Header';
import { useNavigate } from 'react-router-dom';

function FilterGame() {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [duration, setDuration] = useState('');
    const [games, setGames] = useState([]);
    const [activeGameId, setActiveGameId] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("userDetails"));
        if (!user || (user && user.role !== "admin")) {
            navigate('/login-admin');
        }
        axios.get('https://5rj42mtfyd.execute-api.us-east-1.amazonaws.com/Dev/category/getall')
            .then(response => {
                setCategories(response.data);
            })
            .catch(error => {
                console.error("Error fetching categories:", error);
            });
    }, []);

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        let data = {};
        if (selectedCategory) data.categoryId = selectedCategory;
        if (difficulty) data.difficultyLevel = difficulty;
        if (duration) data.duration = Number(duration) * 60;

        axios.post('https://5rj42mtfyd.execute-api.us-east-1.amazonaws.com/Dev/game/filter', data)
            .then(response => {
                setGames(response.data);
            })
            .catch(error => {
                console.error("Error filtering games:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleGameToggle = (gameId) => {
        if (activeGameId === gameId) {
            setActiveGameId(null);
        } else {
            setActiveGameId(gameId);
        }
    };

    const handleGameDelete = (gameId) => {
        setLoading(true);
        axios.post('https://5rj42mtfyd.execute-api.us-east-1.amazonaws.com/Dev/game/delete', {
            gameId
        })
            .then(response => {
                if(response.data.message === "success") {
                    const updatedGames = games.filter(game => game.id !== gameId);
                    setGames(updatedGames);
                }
            })
            .catch(error => {
                console.error("Error deleting game:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    if (loading) {
        return <div className="container mt-5">Loading...</div>;
    }

    return (
        <div>
            <Header />
            <div className="container mt-5" style={{ textAlign: 'left' }}>
                <h2>Filter Games</h2>
                <form onSubmit={handleFilterSubmit}>
                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select className="form-control" id="category" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                            <option value="">Select Category</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="difficulty">Difficulty Level</label>
                        <select className="form-control" id="difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                            <option value="">Select Difficulty</option>
                            <option value="EASY">Easy</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HARD">Hard</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="duration">Duration (seconds)</label>
                        <input type="number" className="form-control" id="duration" value={duration} onChange={e => setDuration(e.target.value)} />
                    </div>
                    <button type="submit" className="btn btn-primary">Filter</button>
                </form>

                <h3 className="mt-5">Filtered Games</h3>
                <ul className="list-group mt-4">
                    {games.map((game, index) => (
                        <li key={game.id} className="list-group-item">
                            <div className="d-flex justify-content-between align-items-center">
                                <span onClick={() => handleGameToggle(game.id)}>
                                    {index + 1}. {game.name} ({game.category})
                                </span>
                                <button className="btn btn-danger btn-sm" onClick={() => handleGameDelete(game.id)}>Delete</button>
                            </div>
                            {activeGameId === game.id &&
                                <div className="mt-3 game-details">
                                    <p><strong>Description:</strong> {game.description}</p>
                                    <p><strong>Difficulty:</strong> {game.difficultyLevel}</p>
                                    <p><strong>Duration:</strong> {game.duration / 60} minutes</p>
                                    <p><strong>Start Time:</strong> {new Date(game.startTime).toLocaleString()}</p>
                                </div>
                            }
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default FilterGame;
