import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';

function Header() {

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login-admin';
    }

    return (
        <Navbar bg="primary" expand="lg" variant="dark">
            <Navbar.Brand as={Link} to="/admin/category">Trivia Management</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="ml-auto">
                    <Nav.Link as={Link} to="/admin/category">Categories</Nav.Link>
                    <NavDropdown title="Questions" id="navbarDropdown">
                        <NavDropdown.Item as={Link} to="/admin/add-questions">Add Question</NavDropdown.Item>
                        <NavDropdown.Item as={Link} to="/admin/filter-questions">Filter Questions</NavDropdown.Item>
                    </NavDropdown>
                    <NavDropdown title="Games" id="navbarGameDropdown">
                        <NavDropdown.Item as={Link} to="/admin/add-game">Add Game</NavDropdown.Item>
                        <NavDropdown.Item as={Link} to="/admin/filter-game">Filter Games</NavDropdown.Item>
                        <NavDropdown.Item as={Link} to="/admin/analyze-gameplay">Analyze Gameplay</NavDropdown.Item> {/* Newly added link */}
                    </NavDropdown>
                </Nav>
            </Navbar.Collapse>
            <Nav className="ml-auto">
                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            </Nav>
        </Navbar>
    );
}

export default Header;
