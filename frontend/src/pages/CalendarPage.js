import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Badge, ListGroup } from 'react-bootstrap';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDateTime } from '../utils/dateHelpers';

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [assignments, setAssignments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await api.assignments.getAll();
      setAssignments(data.assignments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => {
    return (
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            Previous
          </Button>
          <Button variant="outline-primary" onClick={() => setCurrentMonth(new Date())}>
            Today
          </Button>
          <Button variant="outline-primary" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            Next
          </Button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="row g-0 mb-2">
        {days.map((day) => (
          <div key={day} className="col text-center fw-bold text-secondary-custom">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const getAssignmentsForDate = (date) => {
    return assignments.filter((assignment) => {
      const dueDate = new Date(assignment.due_date);
      return isSameDay(dueDate, date);
    });
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd');
        const cloneDay = day;
        const dayAssignments = getAssignmentsForDate(day);

        days.push(
          <div
            key={day}
            className={`col border p-2 ${
              !isSameMonth(day, monthStart) ? 'text-muted' : ''
            } ${isToday(day) ? 'bg-primary bg-opacity-10' : ''}`}
            style={{
              minHeight: '100px',
              cursor: dayAssignments.length > 0 ? 'pointer' : 'default'
            }}
            onClick={() => dayAssignments.length > 0 && setSelectedDate(cloneDay)}
          >
            <div className="fw-bold mb-1">{formattedDate}</div>
            <div className="d-flex flex-wrap gap-1">
              {dayAssignments.slice(0, 3).map((assignment) => (
                <div
                  key={assignment.id}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: assignment.course?.color || '#6B7280'
                  }}
                  title={assignment.title}
                />
              ))}
              {dayAssignments.length > 3 && (
                <small className="text-secondary-custom">+{dayAssignments.length - 3}</small>
              )}
            </div>
          </div>
        );

        day = addDays(day, 1);
      }
      rows.push(
        <div key={day} className="row g-0">
          {days}
        </div>
      );
      days = [];
    }

    return <div>{rows}</div>;
  };

  const renderSelectedDateAssignments = () => {
    if (!selectedDate) return null;

    const dayAssignments = getAssignmentsForDate(selectedDate);

    return (
      <Card className="mt-4">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Assignments on {format(selectedDate, 'MMMM d, yyyy')}</h5>
        </Card.Header>
        <Card.Body>
          {dayAssignments.length === 0 ? (
            <p className="text-secondary-custom mb-0">No assignments on this date</p>
          ) : (
            <ListGroup variant="flush">
              {dayAssignments.map((assignment) => (
                <ListGroup.Item key={assignment.id}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">{assignment.title}</h6>
                      <Badge
                        bg=""
                        style={{ backgroundColor: assignment.course?.color || '#6B7280', color: 'white' }}
                        className="me-2"
                      >
                        {assignment.course?.code || 'N/A'}
                      </Badge>
                      <Badge bg={assignment.priority === 'high' ? 'danger' : assignment.priority === 'medium' ? 'warning' : 'success'}>
                        {assignment.priority}
                      </Badge>
                      <p className="mb-0 mt-2 text-secondary-custom">
                        <small>{formatDateTime(assignment.due_date)}</small>
                      </p>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading calendar..." />;
  }

  return (
    <Container className="page-container">
      <div className="mb-4">
        <h1 className="h2">Assignment Calendar</h1>
        <p className="text-secondary-custom">View your assignments by date</p>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      <Card>
        <Card.Body>
          {renderHeader()}
          {renderDays()}
          {renderCells()}
        </Card.Body>
      </Card>

      {renderSelectedDateAssignments()}
    </Container>
  );
};

export default CalendarPage;