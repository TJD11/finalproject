import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Badge } from 'react-bootstrap';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const TimerPage = () => {
  // Timer state
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  // Timer settings
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);

  // Session data
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [startTime, setStartTime] = useState(null);

  // UI state
  const [showSettingsForm, setShowSettingsForm] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const intervalRef = useRef(null);

  useEffect(() => {
    fetchData();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesData, assignmentsData] = await Promise.all([
        api.courses.getAll(),
        api.assignments.getAll()
      ]);
      setCourses(coursesData.courses);
      setAssignments(assignmentsData.assignments.filter(a => a.status !== 'completed'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const totalTime = (isBreak ? breakDuration : workDuration) * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(console.error);
    } catch (error) {
      console.error('Unable to play notification sound:', error);
    }
  };

  const startTimer = () => {
    if (!isRunning && !isPaused) {
      setStartTime(new Date());
    }
    setIsRunning(true);
    setIsPaused(false);
    setShowSettingsForm(false);

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer completed
          setIsRunning(false);
          setIsPaused(false);
          playNotificationSound();

          if (isBreak) {
            // Break finished, reset to work timer
            setIsBreak(false);
            setTimeLeft(workDuration * 60);
          } else {
            // Work session finished, show save modal
            setShowSaveModal(true);
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // If there was a work session in progress, offer to save it
    if (!isBreak && startTime) {
      setShowSaveModal(true);
    } else {
      resetTimer();
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setIsBreak(false);
    setTimeLeft(workDuration * 60);
    setStartTime(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleSaveSession = async (shouldSave) => {
    if (shouldSave && startTime && !isBreak) {
      const endTime = new Date();
      const durationMinutes = Math.floor((endTime - startTime) / (1000 * 60));

      if (durationMinutes > 0) {
        setSaving(true);

        const sessionData = {
          course_id: selectedCourse || null,
          assignment_id: selectedAssignment || null,
          duration_minutes: durationMinutes,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString()
        };

        try {
          await api.studySessions.create(sessionData);
        } catch (err) {
          setError(err.message);
        } finally {
          setSaving(false);
        }
      }
    }

    setShowSaveModal(false);

    if (!isBreak) {
      // Switch to break timer
      setIsBreak(true);
      setTimeLeft(breakDuration * 60);
      setStartTime(null);
    } else {
      resetTimer();
    }
  };

  const getFilteredAssignments = () => {
    if (!selectedCourse) return assignments;
    return assignments.filter(a => a.course?.id.toString() === selectedCourse);
  };

  if (loading) {
    return <LoadingSpinner message="Loading timer..." />;
  }

  return (
    <Container className="page-container">
      <div className="text-center mb-4">
        <h1 className="h2">Study Timer</h1>
        <p className="text-secondary-custom">Pomodoro technique for focused study sessions</p>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      <Row className="justify-content-center">
        <Col lg={8}>
          <Card>
            <Card.Body className="text-center py-5">
              {/* Timer Display */}
              <div className="mb-4">
                <h3 className="text-secondary-custom mb-2">
                  {isBreak ? 'Break Time' : 'Work Session'}
                </h3>
                <div className="position-relative d-inline-block">
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="10"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke={isBreak ? "#10B981" : "#3B82F6"}
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${getProgressPercentage() * 5.65} 565`}
                      transform="rotate(-90 100 100)"
                      style={{ transition: 'stroke-dasharray 1s ease' }}
                    />
                  </svg>
                  <div
                    className="position-absolute top-50 start-50 translate-middle"
                    style={{ fontSize: '3rem', fontWeight: 'bold' }}
                  >
                    {formatTime(timeLeft)}
                  </div>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="d-flex gap-3 justify-content-center mb-4">
                {!isRunning && !isPaused && (
                  <Button variant="success" size="lg" onClick={startTimer}>
                    Start
                  </Button>
                )}
                {isRunning && (
                  <Button variant="warning" size="lg" onClick={pauseTimer}>
                    Pause
                  </Button>
                )}
                {isPaused && (
                  <Button variant="success" size="lg" onClick={startTimer}>
                    Resume
                  </Button>
                )}
                {(isRunning || isPaused) && (
                  <Button variant="danger" size="lg" onClick={stopTimer}>
                    Stop
                  </Button>
                )}
                <Button
                  variant="outline-secondary"
                  size="lg"
                  onClick={resetTimer}
                  disabled={isRunning}
                >
                  Reset
                </Button>
              </div>

              {/* Settings Toggle */}
              {!isRunning && !isPaused && (
                <Button
                  variant="outline-primary"
                  onClick={() => setShowSettingsForm(!showSettingsForm)}
                >
                  Settings
                </Button>
              )}
            </Card.Body>
          </Card>

          {/* Settings Form */}
          {showSettingsForm && (
            <Card className="mt-4">
              <Card.Header>
                <h5 className="mb-0">Timer Settings</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Work Duration (minutes)</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        max="60"
                        value={workDuration}
                        onChange={(e) => {
                          const newDuration = parseInt(e.target.value);
                          setWorkDuration(newDuration);
                          if (!isBreak) setTimeLeft(newDuration * 60);
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Break Duration (minutes)</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        max="30"
                        value={breakDuration}
                        onChange={(e) => {
                          const newDuration = parseInt(e.target.value);
                          setBreakDuration(newDuration);
                          if (isBreak) setTimeLeft(newDuration * 60);
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Course (optional)</Form.Label>
                      <Form.Select
                        value={selectedCourse}
                        onChange={(e) => {
                          setSelectedCourse(e.target.value);
                          setSelectedAssignment(''); // Reset assignment when course changes
                        }}
                      >
                        <option value="">Select a course</option>
                        {courses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.code} - {course.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Assignment (optional)</Form.Label>
                      <Form.Select
                        value={selectedAssignment}
                        onChange={(e) => setSelectedAssignment(e.target.value)}
                        disabled={!selectedCourse}
                      >
                        <option value="">Select an assignment</option>
                        {getFilteredAssignments().map((assignment) => (
                          <option key={assignment.id} value={assignment.id}>
                            {assignment.title}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Save Session Modal */}
      <Modal show={showSaveModal} onHide={() => handleSaveSession(false)} backdrop="static" centered>
        <Modal.Header>
          <Modal.Title>Save Study Session?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Would you like to save this study session?</p>
          {selectedCourse && (
            <p>
              <Badge
                bg=""
                style={{ backgroundColor: courses.find(c => c.id.toString() === selectedCourse)?.color || '#6B7280', color: 'white' }}
              >
                {courses.find(c => c.id.toString() === selectedCourse)?.code}
              </Badge>
            </p>
          )}
          {selectedAssignment && (
            <p><strong>Assignment:</strong> {assignments.find(a => a.id.toString() === selectedAssignment)?.title}</p>
          )}
          <p><strong>Duration:</strong> {startTime ? Math.floor((new Date() - startTime) / (1000 * 60)) : 0} minutes</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => handleSaveSession(false)} disabled={saving}>
            Don't Save
          </Button>
          <Button variant="primary" onClick={() => handleSaveSession(true)} disabled={saving}>
            {saving ? 'Saving...' : 'Save Session'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TimerPage;