import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDateTime, getTimeRemaining, getUrgencyLevel } from '../utils/dateHelpers';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await api.analytics.getDashboard();
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <Container className="page-container">
        <ErrorMessage message={error} onClose={() => setError('')} />
      </Container>
    );
  }

  const stats = dashboardData?.completion_stats || {};

  return (
    <Container className="page-container">
      <div className="mb-4">
        <h1 className="h2">Welcome back, {user?.username}!</h1>
        <p className="text-secondary-custom">Here's your study progress overview</p>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body>
              <h6 className="text-secondary-custom mb-2">Total Assignments</h6>
              <h2 className="mb-0">{stats.total_assignments || 0}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body>
              <h6 className="text-secondary-custom mb-2">Completed</h6>
              <h2 className="mb-0 text-success">{stats.completed_assignments || 0}</h2>
              <small className="text-secondary-custom">
                {(stats.completion_rate * 100).toFixed(0)}% completion rate
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="h-100">
            <Card.Body>
              <h6 className="text-secondary-custom mb-2">Overdue</h6>
              <h2 className="mb-0 text-danger">{stats.overdue_assignments || 0}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Upcoming Assignments */}
      <Row>
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header className="bg-white">
              <h5 className="mb-0">Upcoming Assignments (Next 7 Days)</h5>
            </Card.Header>
            <Card.Body>
              {dashboardData?.upcoming_assignments?.length > 0 ? (
                <ListGroup variant="flush">
                  {dashboardData.upcoming_assignments.map((assignment) => (
                    <ListGroup.Item
                      key={assignment.id}
                      className="d-flex justify-content-between align-items-start cursor-pointer"
                      onClick={() => navigate('/assignments')}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{assignment.title}</h6>
                        <small>
                          <Badge
                            bg=""
                            style={{
                              backgroundColor: assignment.course?.color || '#6B7280',
                              color: 'white'
                            }}
                            className="me-2"
                          >
                            {assignment.course?.code || 'N/A'}
                          </Badge>
                          <span className={`due-${getUrgencyLevel(assignment.due_date)}`}>
                            Due {getTimeRemaining(assignment.due_date)}
                          </span>
                        </small>
                      </div>
                      <Badge bg={assignment.priority === 'high' ? 'danger' : assignment.priority === 'medium' ? 'warning' : 'success'}>
                        {assignment.priority}
                      </Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-secondary-custom mb-0">No upcoming assignments</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header className="bg-white">
              <h5 className="mb-0">Recent Activity</h5>
            </Card.Header>
            <Card.Body>
              {dashboardData?.recent_activity?.length > 0 ? (
                <ListGroup variant="flush">
                  {dashboardData.recent_activity.map((activity, index) => (
                    <ListGroup.Item key={index}>
                      <div className="d-flex justify-content-between">
                        <div>
                          <p className="mb-1">{activity.description}</p>
                          <small className="text-secondary-custom">{activity.course}</small>
                        </div>
                        <small className="text-secondary-custom">
                          {getTimeRemaining(activity.date)}
                        </small>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-secondary-custom mb-0">No recent activity</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <h5 className="mb-3">Quick Actions</h5>
              <div className="d-flex gap-2 flex-wrap">
                <button className="btn btn-primary" onClick={() => navigate('/courses')}>
                  Manage Courses
                </button>
                <button className="btn btn-primary" onClick={() => navigate('/assignments')}>
                  View Assignments
                </button>
                <button className="btn btn-success" onClick={() => navigate('/timer')}>
                  Start Timer
                </button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;