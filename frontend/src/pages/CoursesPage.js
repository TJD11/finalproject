import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Badge } from 'react-bootstrap';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmDialog from '../components/ConfirmDialog';
import { validateHexColor } from '../utils/validation';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    color: '#3B82F6',
    instructor: '',
    meeting_times: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await api.courses.getAll();
      setCourses(data.courses);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        name: course.name,
        code: course.code,
        color: course.color,
        instructor: course.instructor || '',
        meeting_times: course.meeting_times || ''
      });
    } else {
      setEditingCourse(null);
      setFormData({
        name: '',
        code: '',
        color: '#3B82F6',
        instructor: '',
        meeting_times: ''
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCourse(null);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      errors.name = 'Name must be 100 characters or less';
    }

    if (!formData.code.trim()) {
      errors.code = 'Code is required';
    } else if (formData.code.length > 20) {
      errors.code = 'Code must be 20 characters or less';
    }

    if (!validateHexColor(formData.color)) {
      errors.color = 'Invalid color format';
    }

    if (formData.instructor && formData.instructor.length > 100) {
      errors.instructor = 'Instructor name must be 100 characters or less';
    }

    if (formData.meeting_times && formData.meeting_times.length > 200) {
      errors.meeting_times = 'Meeting times must be 200 characters or less';
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
      if (editingCourse) {
        await api.courses.update(editingCourse.id, formData);
      } else {
        await api.courses.create(formData);
      }
      await fetchCourses();
      handleCloseModal();
    } catch (err) {
      setFormErrors({ general: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;

    try {
      await api.courses.delete(courseToDelete.id);
      await fetchCourses();
      setShowDeleteConfirm(false);
      setCourseToDelete(null);
    } catch (err) {
      setError(err.message);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading courses..." />;
  }

  return (
    <Container className="page-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2">My Courses</h1>
          <p className="text-secondary-custom">Manage your courses and subjects</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          Add Course
        </Button>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      {courses.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <p className="text-secondary-custom mb-3">No courses yet</p>
            <Button variant="primary" onClick={() => handleOpenModal()}>
              Add Your First Course
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {courses.map((course) => (
            <Col key={course.id} lg={4} md={6} className="mb-4">
              <Card className="h-100" style={{ borderLeft: `4px solid ${course.color}` }}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h5 className="mb-1">{course.name}</h5>
                      <Badge bg="secondary">{course.code}</Badge>
                    </div>
                    <Badge
                      bg=""
                      style={{ backgroundColor: course.color, color: 'white', width: '30px', height: '30px' }}
                    >
                    </Badge>
                  </div>

                  {course.instructor && (
                    <p className="mb-1 text-secondary-custom">
                      <small><strong>Instructor:</strong> {course.instructor}</small>
                    </p>
                  )}

                  {course.meeting_times && (
                    <p className="mb-2 text-secondary-custom">
                      <small><strong>Schedule:</strong> {course.meeting_times}</small>
                    </p>
                  )}

                  <p className="mb-3 text-secondary-custom">
                    <small>{course.assignment_count || 0} assignments</small>
                  </p>

                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleOpenModal(course)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteClick(course)}
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

      {/* Course Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingCourse ? 'Edit Course' : 'Add Course'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formErrors.general && <ErrorMessage message={formErrors.general} />}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Course Name *</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                isInvalid={!!formErrors.name}
                placeholder="e.g., Introduction to Computer Science"
              />
              <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Course Code *</Form.Label>
              <Form.Control
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                isInvalid={!!formErrors.code}
                placeholder="e.g., CS50"
              />
              <Form.Control.Feedback type="invalid">{formErrors.code}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Color *</Form.Label>
              <Form.Control
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                isInvalid={!!formErrors.color}
              />
              <Form.Control.Feedback type="invalid">{formErrors.color}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Instructor</Form.Label>
              <Form.Control
                type="text"
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                isInvalid={!!formErrors.instructor}
                placeholder="e.g., Dr. Smith"
              />
              <Form.Control.Feedback type="invalid">{formErrors.instructor}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Meeting Times</Form.Label>
              <Form.Control
                type="text"
                value={formData.meeting_times}
                onChange={(e) => setFormData({ ...formData, meeting_times: e.target.value })}
                isInvalid={!!formErrors.meeting_times}
                placeholder="e.g., Mon/Wed 10:00-11:30"
              />
              <Form.Control.Feedback type="invalid">{formErrors.meeting_times}</Form.Control.Feedback>
            </Form.Group>

            <div className="d-flex gap-2 justify-content-end">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Saving...' : editingCourse ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        show={showDeleteConfirm}
        title="Delete Course"
        message={`Are you sure you want to delete "${courseToDelete?.name}"? This will also delete all associated assignments.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </Container>
  );
};

export default CoursesPage;