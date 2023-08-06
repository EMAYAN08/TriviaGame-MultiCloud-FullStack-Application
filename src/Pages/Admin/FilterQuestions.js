import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import { useNavigate } from 'react-router-dom';

function FilterQuestions() {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [difficulty, setDifficulty] = useState('EASY');
    const [questions, setQuestions] = useState([]);
    const [expandedQuestionId, setExpandedQuestionId] = useState(null);
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

    const handleSubmit = (e) => {
        e.preventDefault();
        setExpandedQuestionId(null);
        setLoading(true);

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
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleQuestionClick = (questionId) => {
        if (expandedQuestionId === questionId) {
            setExpandedQuestionId(null);
        } else {
            setExpandedQuestionId(questionId);
        }
    };

    if (loading) {
        return <div className="container mt-5">Loading...</div>;
    }

    return (
        <div>
            <Header />
            <div className="container mt-5" style={{ textAlign: 'left' }}>
                <h2>Filter Questions</h2>
                <form onSubmit={handleSubmit}>
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
                    <button type="submit" className="btn btn-primary">Filter</button>
                </form>

                <ul className="list-group mt-4">
                    {questions.map((question, index) => (
                        <li
                            key={question.id}
                            className="list-group-item"
                            onClick={() => handleQuestionClick(question.id)}
                            style={{cursor: 'pointer'}}
                        >
                            {index + 1}. {question.questionText}

                            {expandedQuestionId === question.id && (
                                <div className="mt-3">
                                    <strong>Options:</strong>
                                    <ul>
                                        {question.options.map((option, idx) => option && <li key={idx}>{option}</li>)}
                                    </ul>
                                    <strong>Answer:</strong> {question.answers.join(', ')}

                                    {question.tags && question.tags.length > 0 && (
                                        <div>
                                            <strong>Tags:</strong>
                                            <ul>
                                                {question.tags.map((tag, idx) => <li key={idx}>{tag}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default FilterQuestions;
