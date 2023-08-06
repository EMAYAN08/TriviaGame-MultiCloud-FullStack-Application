import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import { useNavigate } from 'react-router-dom';

function AddGame() {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [difficulty, setDifficulty] = useState('EASY');
    const [questions, setQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("userDetails"));
        if (!user || (user && user.role !== "admin")) {
            navigate('/login-admin');
        }
        axios.get('https://5rj42mtfyd.execute-api.us-east-1.amazonaws.com/Dev/category/getall')
            .then(response => {
                setCategories(response.data);
                if (response.data.length > 0) {
                    setSelectedCategory(response.data[0].id);
                }
            })
            .catch(error => {
                console.error("Error fetching categories:", error);
            });
    }, []);

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        const data = {
            categoryId: selectedCategory,
            difficultyLevel: difficulty
        };
        axios.post('https://5rj42mtfyd.execute-api.us-east-1.amazonaws.com/Dev/question/filter', data)
            .then(response => {
                setQuestions(response.data);
            })
            .catch(error => {
                console.error("Error filtering questions:", error);
            });
    };

    const resetForm = () => {
        setSelectedCategory('');
        setDifficulty('EASY');
        setQuestions([]);
        setSelectedQuestions([]);
        setName('');
        setDescription('');
        setStartTime('');
    };

    const handleGameSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        const data = {
            name,
            categoryId: selectedCategory,
            difficultyLevel: difficulty,
            questionIds: selectedQuestions.map(q => q.id),
            startTime: new Date(startTime).toISOString(),
            description,
            participants: []
        };

        axios.post('https://5rj42mtfyd.execute-api.us-east-1.amazonaws.com/Dev/game', data)
            .then(response => {
                resetForm();
            })
            .catch(error => {
                console.error("Error creating game:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const toggleQuestionSelection = (question) => {
        if (selectedQuestions.some(q => q.id === question.id)) {
            setSelectedQuestions(prev => prev.filter(q => q.id !== question.id));
        } else {
            setSelectedQuestions(prev => [...prev, question]);
        }
    };

    return (
        <div>
            <Header />
            <div className="container mt-5" style={{ textAlign: 'left' }}>
                {isLoading ? (
                    <div className="text-center mt-5">
                        <h3>Loading...</h3>
                    </div>
                ) : (
                    <>
                        <h2>Add Game</h2>

                        <form onSubmit={handleFilterSubmit}>
                            <div className="form-group">
                                <label>Category</label>
                                <select className="form-control" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Difficulty Level</label>
                                <select className="form-control" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                                    <option value="EASY">EASY</option>
                                    <option value="MEDIUM">MEDIUM</option>
                                    <option value="HARD">HARD</option>
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary mb-4">Get Questions</button>
                        </form>

                        <form onSubmit={handleGameSubmit}>
                            <div className="form-group">
                                <label>Game Name</label>
                                <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Start Time</label>
                                <input type="datetime-local" className="form-control" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} required />
                            </div>

                            <strong>Select Questions</strong>
                            <ul className="list-group mt-4">
                                {questions.map((question, index) => (
                                    <li
                                        key={question.id}
                                        className="list-group-item"
                                        onClick={() => toggleQuestionSelection(question)}
                                        style={{
                                            cursor: 'pointer',
                                            backgroundColor: selectedQuestions.some(q => q.id === question.id) ? '#d6f5d6' : ''
                                        }}
                                    >
                                        {index + 1}. {question.questionText}
                                    </li>
                                ))}
                            </ul>
                            <button type="submit" className="btn btn-success mt-4">Create Game</button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

export default AddGame;
