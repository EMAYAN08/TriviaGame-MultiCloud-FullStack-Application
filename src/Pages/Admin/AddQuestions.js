import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import { useNavigate } from 'react-router-dom';

function AddQuestions() {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [difficulty, setDifficulty] = useState('EASY');
    const [questionText, setQuestionText] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [answer, setAnswer] = useState('');
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
                if (response.data.length > 0) {
                    setSelectedCategory(response.data[0].id);
                }
            })
            .catch(error => {
                console.error("Error fetching categories:", error);
            });
    }, []);

    const resetFields = () => {
        setSelectedCategory(categories[0].id);
        setDifficulty('EASY');
        setQuestionText('');
        setOptions(['', '', '', '']);
        setAnswer('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (questionText.trim() === '' || options.filter(opt => opt.trim() !== '').length < 2) {
            alert('Please provide a valid question text and at least 2 options.');
            return;
        }

        setLoading(true);

        const data = {
            questionText,
            categoryId: selectedCategory,
            difficultyLevel: difficulty,
            answers: [answer],
            options
        };

        axios.post('https://5rj42mtfyd.execute-api.us-east-1.amazonaws.com/Dev/question', data)
            .then(response => {
                console.log(response.data);
                resetFields();
            })
            .catch(error => {
                console.error("Error adding question:", error);
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
                <h2>Add a New Question</h2>
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
                    <div className="form-group">
                        <label>Question Text</label>
                        <input type="text" className="form-control" value={questionText} onChange={e => setQuestionText(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Options</label>
                        {options.map((option, index) => (
                            <input key={index} type="text" className="form-control mb-2" value={option} onChange={e => {
                                const newOptions = [...options];
                                newOptions[index] = e.target.value;
                                setOptions(newOptions);

                                // Update the default answer when options change
                                if (index === 0 || !answer) {
                                    const firstNonEmptyOption = newOptions.find(opt => opt.trim());
                                    setAnswer(firstNonEmptyOption || '');
                                }
                            }} required={index < 2} />
                        ))}
                    </div>
                    <div className="form-group">
                        <label>Answer</label>
                        <select className="form-control" value={answer} onChange={e => setAnswer(e.target.value)} required>
                            {options.map((option, index) => option.trim() && (
                                <option key={index} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary">Add Question</button>
                </form>
            </div>
        </div>
    );
}

export default AddQuestions;
