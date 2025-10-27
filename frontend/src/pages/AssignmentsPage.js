import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Badge, ButtonGroup } from 'react-bootstrap';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDateTime, getTimeRemaining, getUrgencyLevel } from '../utils/dateHelpers';

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    description: '',
    due_date: '',
    priority: 'medium'
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentsData, coursesData] = await Promise.all([
        api.assignments.getAll(),
        api.courses.getAll()
      ]);
      setAssignments(assignmentsData.assignments);
      setCourses(coursesData.courses);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (assignment = null) => {
    if (assignment) {
      setEditingAssignment(assignment);
      // Convert ISO date to datetime-local format
      const dueDate = new Date(assignment.due_date);
      const localDate = new Date(dueDate.getTime() - dueDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

      setFormData({
        course_id: assignment.course?.id || '',
        title: assignment.title,
        description: assignment.description || '',
        due_date: localDate,
        priority: assignment.priority
      });
    } else {
      setEditingAssignment(null);
      setFormData({
        course_id: courses.length > 0 ? courses[0].id : '',
        title: '',
        description: '',
        due_date: '',
        priority: 'medium'
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAssignment(null);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.course_id) {
      errors.course_id = 'Please select a course';
    }

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      errors.title = 'Title must be 200 characters or less';
    }

    if (formData.description && formData.description.length > 1000) {
      errors.description = 'Description must be 1000 characters or less';
    }

    if (!formData.due_date) {
      errors.due_date = 'Due date is required';
    }

    if (!['low', 'medium', 'high'].includes(formData.priority)) {
      errors.priority = 'Invalid priority';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);

    try {
      // Convert local datetime to ISO format
      const submitData = {
        ...formData,
        due_date: new Date(formData.due_date).toISOString()
      };

      if (editingAssignment) {
        await api.assignments.update(editingAssignment.id, submitData);
      } else {
        await api.assignments.create(submitData);
      }
      await fetchData();
      handleCloseModal();
    } catch (err) {
      setFormErrors({ general: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (assignment, newStatus) => {
    try {
      await api.assignments.update(assignment.id, { status: newStatus });
      await fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteClick = (assignment) => {
    setAssignmentToDelete(assignment);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!assignmentToDelete) return;

    try {
      await api.assignments.delete(assignmentToDelete.id);
      await fetchData();
      setShowDeleteConfirm(false);
      setAssignmentToDelete(null);
    } catch (err) {
      setError(err.message);
      setShowDeleteConfirm(false);
    }
  };

  const getFilteredAssignments = () => {
    if (filterStatus === 'all') return assignments;
    return assignments.filter((a) => a.status === filterStatus);
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'not_started':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading assignments..." />;
  }

  const filteredAssignments = getFilteredAssignments();

  return (
    <Container className="page-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">My Assignments</h1>
          <p className="text-secondary-custom">Track and manage your assignments</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          Add Assignment
        </Button>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      {/* Filter Buttons */}
      <div className="mb-4">
        <ButtonGroup>
          <Button
            variant={filterStatus === 'all' ? 'primary' : 'outline-primary'}
            onClick={() => setFilterStatus('all')}
          >
            All ({assignments.length})
          </Button>
          <Button
            variant={filterStatus === 'not_started' ? 'primary' : 'outline-primary'}
            onClick={() => setFilterStatus('not_started')}
          >
            Not Started ({assignments.filter((a) => a.status === 'not_started').length})
          </Button>
          <Button
            variant={filterStatus === 'in_progress' ? 'primary' : 'outline-primary'}
            onClick={() => setFilterStatus('in_progress')}
          >
            In Progress ({assignments.filter((a) => a.status === 'in_progress').length})
          </Button>
          <Button
            variant={filterStatus === 'completed' ? 'primary' : 'outline-primary'}
            onClick={() => setFilterStatus('completed')}
          >
            Completed ({assignments.filter((a) => a.status === 'completed').length})
          </Button>
        </ButtonGroup>
      </div>

      {filteredAssignments.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <p className="text-secondary-custom mb-3">
              {filterStatus === 'all' ? 'No assignments yet' : `No ${filterStatus.replace('_', ' ')} assignments`}
            </p>
            {courses.length === 0 ? (
              <p className="text-secondary-custom">Please add a course first to create assignments</p>
            ) : (
              <Button variant="primary" onClick={() => handleOpenModal()}>
                Add Your First Assignment
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {filteredAssignments.map((assignment) => (
            <Col key={assignment.id} lg={6} className="mb-3">
              <Card className="h-100" style={{ borderLeft: `4px solid ${assignment.course?.color || '#6B7280'}` }}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="mb-0">{assignment.title}</h5>
                    <div className="d-flex gap-1">
                      <Badge bg={getPriorityBadgeClass(assignment.priority)}>
                        {assignment.priority}
                      </Badge>
                      <Badge bg={getStatusBadgeClass(assignment.status)}>
                        {assignment.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <div className="mb-2">
                    <Badge
                      bg=""
                      style={{ backgroundColor: assignment.course?.color || '#6B7280', color: 'white' }}
                    >
                      {assignment.course?.code || 'N/A'}
                    </Badge>
                  </div>

                  {assignment.description && (
                    <p className="text-secondary-custom mb-2">
                      {assignment.description.length > 100
                        ? `${assignment.description.substring(0, 100)}...`
                        : assignment.description}
                    </p>
                  )}

                  <p className={`mb-3 due-${getUrgencyLevel(assignment.due_date)}`}>
                    <strong>Due:</strong> {formatDateTime(assignment.due_date)}
                    <br />
                    <small>{getTimeRemaining(assignment.due_date)}</small>
                  </p>

                  <div className="d-flex gap-2 flex-wrap">
                    {assignment.status !== 'completed' && (
                      <>
                        {assignment.status === 'not_started' && (
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleStatusChange(assignment, 'in_progress')}
                          >
                            Start
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => handleStatusChange(assignment, 'completed')}
                        >
                          Mark Complete
                        </Button>
                      </>
                    )}
                    {assignment.status === 'completed' && (
                      <Button
                        size="sm"
                        variant="outline-warning"
                        onClick={() => handleStatusChange(assignment, 'in_progress')}
                      >
                        Reopen
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => handleOpenModal(assignment)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDeleteClick(assignment)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Assignment Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingAssignment ? 'Edit Assignment' : 'Add Assignment'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formErrors.general && <ErrorMessage message={formErrors.general} />}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Course *</Form.Label>
              <Form.Select
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: parseInt(e.target.value) })}
                isInvalid={!!formErrors.course_id}
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{formErrors.course_id}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Title *</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                isInvalid={!!formErrors.title}
                placeholder="e.g., Problem Set 5"
              />
              <Form.Control.Feedback type="invalid">{formErrors.title}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                isInvalid={!!formErrors.description}
                placeholder="Assignment details..."
              />
              <Form.Control.Feedback type="invalid">{formErrors.description}</Form.Control.Feedback>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Due Date & Time *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    isInvalid={!!formErrors.due_date}
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.due_date}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Priority *</Form.Label>
                  <Form.Select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    isInvalid={!!formErrors.priority}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{formErrors.priority}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-2 justify-content-end">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Saving...' : editingAssignment ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        show={showDeleteConfirm}
        title="Delete Assignment"
        message={`Are you sure you want to delete "${assignmentToDelete?.title}"?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </Container>
  );
};

export default AssignmentsPage;