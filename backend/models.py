from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()


class User(UserMixin, db.Model):
    """User account model for authentication and data isolation."""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    courses = db.relationship('Course', backref='owner', lazy=True, cascade='all, delete-orphan')
    assignments = db.relationship('Assignment', backref='owner', lazy=True, cascade='all, delete-orphan')
    study_sessions = db.relationship('StudySession', backref='owner', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        """Convert user to dictionary (excluding password)."""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email
        }


class Course(db.Model):
    """Course model storing user's course information."""
    __tablename__ = 'courses'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(20), nullable=False)
    color = db.Column(db.String(7), nullable=False)  # Hex color format
    instructor = db.Column(db.String(100), nullable=True)
    meeting_times = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    assignments = db.relationship('Assignment', backref='course', lazy=True, cascade='all, delete-orphan')
    study_sessions = db.relationship('StudySession', backref='course', lazy=True)

    def to_dict(self, include_assignment_count=False):
        """Convert course to dictionary."""
        result = {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'color': self.color,
            'instructor': self.instructor,
            'meeting_times': self.meeting_times,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if include_assignment_count:
            result['assignment_count'] = len(self.assignments)
        return result


class Assignment(db.Model):
    """Assignment model storing tasks linked to courses."""
    __tablename__ = 'assignments'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    due_date = db.Column(db.DateTime, nullable=False)
    priority = db.Column(db.String(10), nullable=False)  # low, medium, high
    status = db.Column(db.String(20), nullable=False, default='not_started')  # not_started, in_progress, completed
    completed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    study_sessions = db.relationship('StudySession', backref='assignment', lazy=True)

    def to_dict(self, include_course=True):
        """Convert assignment to dictionary."""
        result = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'priority': self.priority,
            'status': self.status,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if include_course and self.course:
            result['course'] = {
                'id': self.course.id,
                'name': self.course.name,
                'code': self.course.code,
                'color': self.course.color
            }
        return result


class StudySession(db.Model):
    """Study session model storing completed timer sessions."""
    __tablename__ = 'study_sessions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id', ondelete='SET NULL'), nullable=True)
    assignment_id = db.Column(db.Integer, db.ForeignKey('assignments.id', ondelete='SET NULL'), nullable=True)
    duration_minutes = db.Column(db.Integer, nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self, include_relations=True):
        """Convert study session to dictionary."""
        result = {
            'id': self.id,
            'duration_minutes': self.duration_minutes,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if include_relations:
            if self.course:
                result['course'] = {
                    'id': self.course.id,
                    'name': self.course.name,
                    'code': self.course.code,
                    'color': self.course.color
                }
            else:
                result['course'] = None

            if self.assignment:
                result['assignment'] = {
                    'id': self.assignment.id,
                    'title': self.assignment.title
                }
            else:
                result['assignment'] = None
        return result
