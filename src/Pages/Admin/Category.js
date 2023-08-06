import Header from './Header';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Category() {
    const [categories, setCategories] = useState([]);
    const [displayedCategories, setDisplayedCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("userDetails"));
        if (!user || (user && user.role !== "admin")) {
            navigate('/login-admin');
        }
        fetchCategories();
    }, []);

    useEffect(() => {
        filterCategories(searchTerm);
    }, [categories, searchTerm]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('https://5rj42mtfyd.execute-api.us-east-1.amazonaws.com/Dev/category/getall');
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const filterCategories = (term) => {
        if (term) {
            const filtered = categories.filter(category => category.name.toLowerCase().includes(term.toLowerCase()));
            setDisplayedCategories(filtered);
        } else {
            setDisplayedCategories(categories);
        }
    };

    const handleAddCategory = async () => {
        setErrorMessage('');
        if (!newCategoryName.trim()) {
            setErrorMessage('Category name is required.');
            return;
        }
        try {
            const response = await axios.post('https://5rj42mtfyd.execute-api.us-east-1.amazonaws.com/Dev/category', {
                name: newCategoryName
            });
            if (response.data && response.data.categoryId) {
                fetchCategories();
                setNewCategoryName('');
            }
        } catch (error) {
            console.error("Error adding category:", error);
        }
    };

    return (
        <div>
            <Header />
            <div className="container mt-5" style={{ textAlign: 'left' }}>
                <h2>Manage Categories</h2>

                <div className="mb-5 border p-4 rounded">
                    <h4>Add a Category</h4>
                    <input type="text" className="form-control mb-3" placeholder="New Category Name" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
                    {errorMessage && <div className="text-danger mb-3">{errorMessage}</div>}
                    <button className="btn btn-primary" onClick={handleAddCategory}>Add Category</button>
                </div>

                <div className="border p-4 rounded">
                    <h4>Categories List</h4>
                    <input type="text" className="form-control mb-3" placeholder="Search by Category Name" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    <ul className="list-group">
                        {displayedCategories.map((category, index) => (
                            <li key={category.id} className="list-group-item d-flex justify-content-between align-items-center">
                                <span className="mr-2">{index + 1}. {category.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Category;
