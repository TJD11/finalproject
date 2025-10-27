from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from sqlalchemy import func

from .models import db, User, Course, Assignment, StudySession
from .utils import (
    validate_email, validate_hex_color, validate_username,
    validate_password, normalize_string, calculate_duration_minutes
)

api = Blueprint('api', __name__, url_prefix='/api')


# ============================================================================
# Authentication Endpoints
# ============================================================================

@api.route('/auth/register', methods=['POST'])
def register():
    """Register new user account."""
    data = request.get_json()

    # Validate required fields
    if not data:
        return jsonify({'error': 'No data provided'}), 422

    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    confirm_password = data.get('confirmPassword', '')

    # Validation
    if not username or not email or not password or not confirm_password:
        return jsonify({'error': 'All fields are required'}), 422

    if not validate_username(username):
        return jsonify({'error': 'Username must be 3-20 characters, alphanumeric and underscore only'}), 400

    if not validate_email(email):
        return jsonify({'error': 'Invalid email format'}), 400

    if not validate_password(password):
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    if password != confirm_password:
        return jsonify({'error': 'Passwords do not match'}), 400

    # Check uniqueness (case-insensitive)
    existing_user = User.query.filter(
        (func.lower(User.username) == username.lower()) |
        (func.lower(User.email) == email.lower())
    ).first()

    if existing_user:
        if existing_user.username.lower() == username.lower():
            return jsonify({'error': 'Username already exists'}), 400
        else:
            return jsonify({'error': 'Email already exists'}), 400

    # Create user
    password_hash = generate_password_hash(password)
    new_user = User(username=username, email=email, password_hash=password_hash)

    try:
        db.session.add(new_user)
        db.session.commit()
        login_user(new_user)
        return jsonify({
            'message': 'Registration successful',
            'user': new_user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed'}), 500


@api.route('/auth/login', methods=['POST'])
def login():
    """Login existing user."""
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 422

    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 422

    # Find user (case-insensitive)
    user = User.query.filter(func.lower(User.username) == username.lower()).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid username or password'}), 401

    login_user(user)
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict()
    }), 200


@api.route('/auth/logout', methods=['POST'])
@login_required
def logout():
    """Logout current user."""
    logout_user()
    return jsonify({'message': 'Logout successful'}), 200


@api.route('/auth/me', methods=['GET'])
@login_required
def get_current_user():
    """Get current user information."""
    return jsonify({'user': current_user.to_dict()}), 200


# ============================================================================
# Course Management Endpoints
# ============================================================================

@api.route('/courses', methods=['GET'])
@login_required
def get_courses():
    """Get all courses for current user."""
    courses = Course.query.filter_by(user_id=current_user.id).order_by(Course.created_at.desc()).all()
    return jsonify({
        'courses': [course.to_dict(include_assignment_count=True) for course in courses]
    }), 200


@api.route('/courses', methods=['POST'])
@login_required
def create_course():
    """Create new course."""
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 422

    name = data.get('name', '').strip()
    code = data.get('code', '').strip()
    color = data.get('color', '').strip()
    instructor = data.get('instructor', '').strip() or None
    meeting_times = data.get('meeting_times', '').strip() or None

    # Validation
    if not name or not code or not color:
        return jsonify({'error': 'Name, code, and color are required'}), 422

    if len(name) > 100:
        return jsonify({'error': 'Name must be 100 characters or less'}), 400

    if len(code) > 20:
        return jsonify({'error': 'Code must be 20 characters or less'}), 400

    if not validate_hex_color(color):
        return jsonify({'error': 'Color must be in hex format (#RRGGBB)'}), 400

    if instructor and len(instructor) > 100:
        return jsonify({'error': 'Instructor name must be 100 characters or less'}), 400

    if meeting_times and len(meeting_times) > 200:
        return jsonify({'error': 'Meeting times must be 200 characters or less'}), 400

    # Create course
    new_course = Course(
        user_id=current_user.id,
        name=name,
        code=code,
        color=color,
        instructor=instructor,
        meeting_times=meeting_times
    )

    try:
        db.session.add(new_course)
        db.session.commit()
        return jsonify({
            'message': 'Course created',
            'course': new_course.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create course'}), 500


@api.route('/courses/<int:course_id>', methods=['PUT'])
@login_required
def update_course(course_id):
    """Update existing course."""
    course = Course.query.get(course_id)

    if not course:
        return jsonify({'error': 'Course not found'}), 404

    if course.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 422

    # Update fields if provided
    if 'name' in data:
        name = data['name'].strip()
        if not name or len(name) > 100:
            return jsonify({'error': 'Invalid name'}), 400
        course.name = name

    if 'code' in data:
        code = data['code'].strip()
        if not code or len(code) > 20:
            return jsonify({'error': 'Invalid code'}), 400
        course.code = code

    if 'color' in data:
        color = data['color'].strip()
        if not validate_hex_color(color):
            return jsonify({'error': 'Invalid color format'}), 400
        course.color = color

    if 'instructor' in data:
        instructor = data['instructor'].strip() or None
        if instructor and len(instructor) > 100:
            return jsonify({'error': 'Instructor name too long'}), 400
        course.instructor = instructor

    if 'meeting_times' in data:
        meeting_times = data['meeting_times'].strip() or None
        if meeting_times and len(meeting_times) > 200:
            return jsonify({'error': 'Meeting times too long'}), 400
        course.meeting_times = meeting_times

    try:
        db.session.commit()
        return jsonify({
            'message': 'Course updated',
            'course': course.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update course'}), 500


@api.route('/courses/<int:course_id>', methods=['DELETE'])
@login_required
def delete_course(course_id):
    """Delete course and associated assignments."""
    course = Course.query.get(course_id)

    if not course:
        return jsonify({'error': 'Course not found'}), 404

    if course.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    try:
        db.session.delete(course)
        db.session.commit()
        return jsonify({'message': 'Course deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete course'}), 500


# ============================================================================
# Assignment Management Endpoints
# ============================================================================

@api.route('/assignments', methods=['GET'])
@login_required
def get_assignments():
    """Get all assignments for current user with optional filters."""
    query = Assignment.query.filter_by(user_id=current_user.id)

    # Apply filters
    course_id = request.args.get('course_id', type=int)
    if course_id:
        query = query.filter_by(course_id=course_id)

    status = request.args.get('status')
    if status:
        query = query.filter_by(status=status)

    priority = request.args.get('priority')
    if priority:
        query = query.filter_by(priority=priority)

    assignments = query.order_by(Assignment.due_date.asc()).all()

    return jsonify({
        'assignments': [assignment.to_dict(include_course=True) for assignment in assignments]
    }), 200


@api.route('/assignments', methods=['POST'])
@login_required
def create_assignment():
    """Create new assignment."""
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 422

    course_id = data.get('course_id')
    title = data.get('title', '').strip()
    description = data.get('description', '').strip() or None
    due_date_str = data.get('due_date')
    priority = data.get('priority', '').strip().lower()

    # Validation
    if not course_id or not title or not due_date_str or not priority:
        return jsonify({'error': 'Course, title, due date, and priority are required'}), 422

    # Verify course exists and belongs to user
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'error': 'Course not found'}), 400

    if course.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    if len(title) > 200:
        return jsonify({'error': 'Title must be 200 characters or less'}), 400

    if description and len(description) > 1000:
        return jsonify({'error': 'Description must be 1000 characters or less'}), 400

    if priority not in ['low', 'medium', 'high']:
        return jsonify({'error': 'Priority must be low, medium, or high'}), 400

    # Parse due date
    try:
        due_date = datetime.fromisoformat(due_date_str.replace('Z', '+00:00'))
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400

    # Create assignment
    new_assignment = Assignment(
        user_id=current_user.id,
        course_id=course_id,
        title=title,
        description=description,
        due_date=due_date,
        priority=priority,
        status='not_started'
    )

    try:
        db.session.add(new_assignment)
        db.session.commit()
        return jsonify({
            'message': 'Assignment created',
            'assignment': new_assignment.to_dict(include_course=True)
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create assignment'}), 500


@api.route('/assignments/<int:assignment_id>', methods=['PUT'])
@login_required
def update_assignment(assignment_id):
    """Update assignment."""
    assignment = Assignment.query.get(assignment_id)

    if not assignment:
        return jsonify({'error': 'Assignment not found'}), 404

    if assignment.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 422

    # Track status changes
    old_status = assignment.status

    # Update fields if provided
    if 'title' in data:
        title = data['title'].strip()
        if not title or len(title) > 200:
            return jsonify({'error': 'Invalid title'}), 400
        assignment.title = title

    if 'description' in data:
        description = data['description'].strip() or None
        if description and len(description) > 1000:
            return jsonify({'error': 'Description too long'}), 400
        assignment.description = description

    if 'due_date' in data:
        try:
            due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
            assignment.due_date = due_date
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400

    if 'priority' in data:
        priority = data['priority'].strip().lower()
        if priority not in ['low', 'medium', 'high']:
            return jsonify({'error': 'Invalid priority'}), 400
        assignment.priority = priority

    if 'status' in data:
        status = data['status'].strip().lower()
        if status not in ['not_started', 'in_progress', 'completed']:
            return jsonify({'error': 'Invalid status'}), 400
        assignment.status = status

        # Handle completed_at timestamp
        if status == 'completed' and old_status != 'completed':
            assignment.completed_at = datetime.utcnow()
        elif status != 'completed' and old_status == 'completed':
            assignment.completed_at = None

    if 'course_id' in data:
        course_id = data['course_id']
        course = Course.query.get(course_id)
        if not course or course.user_id != current_user.id:
            return jsonify({'error': 'Invalid course'}), 400
        assignment.course_id = course_id

    try:
        db.session.commit()
        return jsonify({
            'message': 'Assignment updated',
            'assignment': assignment.to_dict(include_course=True)
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update assignment'}), 500


@api.route('/assignments/<int:assignment_id>', methods=['DELETE'])
@login_required
def delete_assignment(assignment_id):
    """Delete assignment."""
    assignment = Assignment.query.get(assignment_id)

    if not assignment:
        return jsonify({'error': 'Assignment not found'}), 404

    if assignment.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403

    try:
        db.session.delete(assignment)
        db.session.commit()
        return jsonify({'message': 'Assignment deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete assignment'}), 500


# ============================================================================
# Study Session Endpoints
# ============================================================================

@api.route('/study-sessions', methods=['GET'])
@login_required
def get_study_sessions():
    """Get study sessions for current user with optional filters."""
    query = StudySession.query.filter_by(user_id=current_user.id)

    # Apply filters
    course_id = request.args.get('course_id', type=int)
    if course_id:
        query = query.filter_by(course_id=course_id)

    assignment_id = request.args.get('assignment_id', type=int)
    if assignment_id:
        query = query.filter_by(assignment_id=assignment_id)

    start_date_str = request.args.get('start_date')
    if start_date_str:
        try:
            start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
            query = query.filter(StudySession.start_time >= start_date)
        except ValueError:
            pass

    end_date_str = request.args.get('end_date')
    if end_date_str:
        try:
            end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
            query = query.filter(StudySession.end_time <= end_date)
        except ValueError:
            pass

    sessions = query.order_by(StudySession.start_time.desc()).all()

    # Calculate total minutes
    total_minutes = sum(session.duration_minutes for session in sessions)

    return jsonify({
        'sessions': [session.to_dict(include_relations=True) for session in sessions],
        'total_minutes': total_minutes
    }), 200


@api.route('/study-sessions', methods=['POST'])
@login_required
def create_study_session():
    """Create completed study session."""
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 422

    course_id = data.get('course_id')
    assignment_id = data.get('assignment_id')
    duration_minutes = data.get('duration_minutes')
    start_time_str = data.get('start_time')
    end_time_str = data.get('end_time')

    # Validation
    if not duration_minutes or not start_time_str or not end_time_str:
        return jsonify({'error': 'Duration, start time, and end time are required'}), 422

    if not isinstance(duration_minutes, int) or duration_minutes <= 0:
        return jsonify({'error': 'Duration must be a positive integer'}), 400

    # Parse times
    try:
        start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
        end_time = datetime.fromisoformat(end_time_str.replace('Z', '+00:00'))
    except ValueError:
        return jsonify({'error': 'Invalid time format'}), 400

    # Validate times
    if end_time <= start_time:
        return jsonify({'error': 'End time must be after start time'}), 400

    # Verify duration consistency
    calculated_duration = calculate_duration_minutes(start_time, end_time)
    if calculated_duration is None or abs(calculated_duration - duration_minutes) > 1:
        return jsonify({'error': 'Duration does not match time range'}), 400

    # Verify course belongs to user (if provided)
    if course_id:
        course = Course.query.get(course_id)
        if not course or course.user_id != current_user.id:
            return jsonify({'error': 'Invalid course'}), 403

    # Verify assignment belongs to user (if provided)
    if assignment_id:
        assignment = Assignment.query.get(assignment_id)
        if not assignment or assignment.user_id != current_user.id:
            return jsonify({'error': 'Invalid assignment'}), 403

        # Validate assignment matches course (if course provided)
        if course_id and assignment.course_id != course_id:
            return jsonify({'error': 'Assignment does not belong to specified course'}), 400

    # Create session
    new_session = StudySession(
        user_id=current_user.id,
        course_id=course_id,
        assignment_id=assignment_id,
        duration_minutes=duration_minutes,
        start_time=start_time,
        end_time=end_time
    )

    try:
        db.session.add(new_session)
        db.session.commit()
        return jsonify({
            'message': 'Study session recorded',
            'session': new_session.to_dict(include_relations=True)
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create study session'}), 500


# ============================================================================
# Analytics Endpoints
# ============================================================================

@api.route('/analytics/dashboard', methods=['GET'])
@login_required
def get_dashboard_analytics():
    """Get dashboard analytics for current user."""
    now = datetime.utcnow()
    seven_days_later = now + timedelta(days=7)

    # Upcoming assignments (next 7 days)
    upcoming_assignments = Assignment.query.filter(
        Assignment.user_id == current_user.id,
        Assignment.due_date >= now,
        Assignment.due_date <= seven_days_later,
        Assignment.status != 'completed'
    ).order_by(Assignment.due_date.asc()).all()

    # Completion statistics
    total_assignments = Assignment.query.filter_by(user_id=current_user.id).count()
    completed_assignments = Assignment.query.filter_by(
        user_id=current_user.id,
        status='completed'
    ).count()

    completion_rate = completed_assignments / total_assignments if total_assignments > 0 else 0

    overdue_assignments = Assignment.query.filter(
        Assignment.user_id == current_user.id,
        Assignment.due_date < now,
        Assignment.status != 'completed'
    ).count()

    # Study time by course
    study_time_by_course = db.session.query(
        Course.id,
        Course.name,
        Course.color,
        func.sum(StudySession.duration_minutes).label('total_minutes')
    ).join(StudySession, StudySession.course_id == Course.id)\
     .filter(Course.user_id == current_user.id)\
     .group_by(Course.id, Course.name, Course.color)\
     .all()

    study_time_data = [
        {
            'course_id': row[0],
            'course_name': row[1],
            'course_color': row[2],
            'total_minutes': row[3] or 0
        }
        for row in study_time_by_course
    ]

    # Recent activity (last 5 study sessions or assignment completions)
    recent_sessions = StudySession.query.filter_by(user_id=current_user.id)\
        .order_by(StudySession.created_at.desc())\
        .limit(5)\
        .all()

    recent_completions = Assignment.query.filter(
        Assignment.user_id == current_user.id,
        Assignment.completed_at.isnot(None)
    ).order_by(Assignment.completed_at.desc()).limit(5).all()

    # Combine and sort recent activity
    recent_activity = []
    for session in recent_sessions:
        recent_activity.append({
            'type': 'study_session',
            'date': session.created_at.isoformat(),
            'description': f"Studied for {session.duration_minutes} minutes",
            'course': session.course.name if session.course else 'General'
        })

    for assignment in recent_completions:
        recent_activity.append({
            'type': 'assignment_completed',
            'date': assignment.completed_at.isoformat(),
            'description': f"Completed: {assignment.title}",
            'course': assignment.course.name if assignment.course else 'Unknown'
        })

    # Sort by date descending and limit to 5
    recent_activity.sort(key=lambda x: x['date'], reverse=True)
    recent_activity = recent_activity[:5]

    return jsonify({
        'upcoming_assignments': [a.to_dict(include_course=True) for a in upcoming_assignments],
        'completion_stats': {
            'total_assignments': total_assignments,
            'completed_assignments': completed_assignments,
            'completion_rate': round(completion_rate, 2),
            'overdue_assignments': overdue_assignments
        },
        'study_time_by_course': study_time_data,
        'recent_activity': recent_activity
    }), 200
