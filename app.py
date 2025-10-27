import os
from flask import Flask, send_from_directory
from flask_login import LoginManager
from flask_cors import CORS
from dotenv import load_dotenv

from backend.models import db, User
from backend.routes import api

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__, static_folder='static')

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)
CORS(app, supports_credentials=True, origins=['http://localhost:3000'])

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'


@login_manager.user_loader
def load_user(user_id):
    """Load user by ID for Flask-Login."""
    return User.query.get(int(user_id))


@login_manager.unauthorized_handler
def unauthorized():
    """Handle unauthorized access."""
    return {'error': 'Unauthorized'}, 401


# Register blueprints
app.register_blueprint(api)


# Serve React static files
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    """Serve React app for all non-API routes."""
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


# Create database tables
with app.app_context():
    db.create_all()
    print("Database tables created successfully!")


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
