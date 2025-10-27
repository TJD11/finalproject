import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar as BSNavbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <BSNavbar bg="white" expand="lg" className="shadow-sm mb-0" sticky="top">
      <Container fluid>
        <BSNavbar.Brand as={Link} to="/" className="fw-bold text-primary-custom">
          StudyTracker
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="navbar-nav" />
        <BSNavbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" active={isActive('/')}>
              Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/courses" active={isActive('/courses')}>
              Courses
            </Nav.Link>
            <Nav.Link as={Link} to="/assignments" active={isActive('/assignments')}>
              Assignments
            </Nav.Link>
            <Nav.Link as={Link} to="/calendar" active={isActive('/calendar')}>
              Calendar
            </Nav.Link>
            <Nav.Link as={Link} to="/timer" active={isActive('/timer')}>
              Timer
            </Nav.Link>
            <Nav.Link as={Link} to="/analytics" active={isActive('/analytics')}>
              Analytics
            </Nav.Link>
          </Nav>
          <Nav>
            <NavDropdown title={user?.username || 'User'} align="end">
              <NavDropdown.Item onClick={handleLogout}>
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;
