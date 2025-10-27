import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatMinutesToHours } from '../utils/dateHelpers';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashData, assignmentsData] = await Promise.all([
        api.analytics.getDashboard(),
        api.assignments.getAll()
      ]);
      setDashboardData(dashData);
      setAssignments(assignmentsData.assignments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStudyTimeChartData = () => {
    if (!dashboardData?.study_time_by_course) {
      return {
        labels: [],
        datasets: []
      };
    }

    const data = dashboardData.study_time_by_course;

    return {
      labels: data.map(item => item.course_name),
      datasets: [
        {
          label: 'Study Time (minutes)',
          data: data.map(item => item.total_minutes),
          backgroundColor: data.map(item => item.course_color),
          borderColor: data.map(item => item.course_color),
          borderWidth: 1
        }
      ]
    };
  };

  const getPriorityDistributionData = () => {
    const priorityCounts = {
      low: 0,
      medium: 0,
      high: 0
    };

    assignments.forEach(assignment => {
      if (assignment.status !== 'completed') {
        priorityCounts[assignment.priority] = (priorityCounts[assignment.priority] || 0) + 1;
      }
    });

    return {
      labels: ['Low Priority', 'Medium Priority', 'High Priority'],
      datasets: [
        {
          label: 'Assignments by Priority',
          data: [priorityCounts.low, priorityCounts.medium, priorityCounts.high],
          backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
          borderColor: ['#10B981', '#F59E0B', '#EF4444'],
          borderWidth: 1
        }
      ]
    };
  };

  const getCompletionTrendData = () => {
    // Get last 30 days of completed assignments
    const last30Days = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      last30Days.push(date);
    }

    const completionCounts = last30Days.map(date => {
      return assignments.filter(assignment => {
        if (!assignment.completed_at) return false;
        const completedDate = new Date(assignment.completed_at);
        completedDate.setHours(0, 0, 0, 0);
        return completedDate.getTime() === date.getTime();
      }).length;
    });

    return {
      labels: last30Days.map(date => {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}/${day}`;
      }),
      datasets: [
        {
          label: 'Assignments Completed',
          data: completionCounts,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading analytics..." />;
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
        <h1 className="h2">Analytics Dashboard</h1>
        <p className="text-secondary-custom">Track your study progress and performance</p>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      {/* Completion Statistics */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <h6 className="text-secondary-custom mb-2">Total Assignments</h6>
              <h2 className="mb-0">{stats.total_assignments || 0}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <h6 className="text-secondary-custom mb-2">Completed</h6>
              <h2 className="mb-0 text-success">{stats.completed_assignments || 0}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <h6 className="text-secondary-custom mb-2">Completion Rate</h6>
              <h2 className="mb-0 text-primary">{(stats.completion_rate * 100).toFixed(0)}%</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <h6 className="text-secondary-custom mb-2">Overdue</h6>
              <h2 className="mb-0 text-danger">{stats.overdue_assignments || 0}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Study Time by Course Chart */}
      <Row className="mb-4">
        <Col lg={8} className="mb-4">
          <Card>
            <Card.Header className="bg-white">
              <h5 className="mb-0">Study Time by Course</h5>
            </Card.Header>
            <Card.Body>
              {dashboardData?.study_time_by_course?.length > 0 ? (
                <Bar data={getStudyTimeChartData()} options={chartOptions} />
              ) : (
                <div className="text-center py-5">
                  <p className="text-secondary-custom mb-0">No study sessions recorded yet</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Priority Distribution Chart */}
        <Col lg={4} className="mb-4">
          <Card className="h-100">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Priority Distribution</h5>
            </Card.Header>
            <Card.Body>
              {assignments.filter(a => a.status !== 'completed').length > 0 ? (
                <Pie data={getPriorityDistributionData()} options={chartOptions} />
              ) : (
                <div className="text-center py-5">
                  <p className="text-secondary-custom mb-0">No active assignments</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Completion Trend Chart */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="bg-white">
              <h5 className="mb-0">Assignment Completion Trend (Last 30 Days)</h5>
            </Card.Header>
            <Card.Body>
              {assignments.filter(a => a.completed_at).length > 0 ? (
                <Line data={getCompletionTrendData()} options={chartOptions} />
              ) : (
                <div className="text-center py-5">
                  <p className="text-secondary-custom mb-0">No completed assignments yet</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Study Time Summary */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="bg-white">
              <h5 className="mb-0">Study Time Summary</h5>
            </Card.Header>
            <Card.Body>
              {dashboardData?.study_time_by_course?.length > 0 ? (
                <div>
                  {dashboardData.study_time_by_course.map(item => (
                    <div key={item.course_id} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                      <div className="d-flex align-items-center">
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: item.course_color,
                            borderRadius: '4px',
                            marginRight: '12px'
                          }}
                        />
                        <span>{item.course_name}</span>
                      </div>
                      <strong>{formatMinutesToHours(item.total_minutes)}</strong>
                    </div>
                  ))}
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <strong>Total Study Time</strong>
                    <strong className="text-primary">
                      {formatMinutesToHours(
                        dashboardData.study_time_by_course.reduce((sum, item) => sum + item.total_minutes, 0)
                      )}
                    </strong>
                  </div>
                </div>
              ) : (
                <p className="text-secondary-custom mb-0">No study time recorded yet. Start using the timer to track your study sessions!</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AnalyticsPage;