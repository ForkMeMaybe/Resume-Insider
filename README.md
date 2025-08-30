# AI-Powered Document Insight Tool

## Project Overview

This project implements an AI-powered document insight tool, allowing users to upload PDF documents (primarily resumes) and receive concise summaries or key insights. It maintains a historical record of uploaded documents and their analyses, providing a seamless user experience. The application demonstrates full-stack development, integrating backend processing with a responsive frontend, robust data management, and external AI service interaction.

## Technical Stack

*   **Backend:** Django (Python)
*   **Database:** PostgreSQL (Recommended for production), SQLite (Default for quick start)
*   **Asynchronous Tasks:** Celery with Redis as a message broker
*   **AI Integration:** Google Gemini API (with a robust fallback mechanism)
*   **API Framework:** Django REST Framework
*   **Authentication:** Djoser + `djangorestframework-simplejwt` (JWT-based)
*   **Frontend:** React (JavaScript)
*   **Frontend Build Tool:** Vite
*   **UI Library:** Material-UI (MUI)

## Setup and Running Instructions

### Prerequisites

Before you begin, ensure you have the following installed:

*   **Python 3.8+**
*   **pipenv** (Python package manager): `pip install pipenv`
*   **Node.js** (LTS version recommended) & **npm** (Node Package Manager)
*   **Docker** (for running Redis)
*   **PostgreSQL** (Optional, if you choose not to use SQLite)

### 1. Clone the Repository

```bash
git clone 
cd Resume-Insider
```

### 2. Backend Setup

Navigate to the project root directory (`Resume-Insider/`).

#### a. Install Python Dependencies

```bash
pipenv install
```

#### b. Database Configuration

The project is configured to use **SQLite** by default for quick setup. For a more robust solution, **PostgreSQL** is recommended.

*   **Option 1: SQLite (Default)**
    No additional setup is required. Just run migrations:
    ```bash
    pipenv run python manage.py migrate
    ```

*   **Option 2: PostgreSQL (Recommended)**
    1.  Ensure you have a PostgreSQL server running.
    2.  Connect to your PostgreSQL server (e.g., using `psql`) and create a database and user for the project. Replace `YOUR_CHOSEN_PASSWORD` with a strong password.
        ```sql
        -- Create the database
        CREATE DATABASE resume_insider;

        -- Create the user
        CREATE USER resume_insider WITH PASSWORD 'YOUR_CHOSEN_PASSWORD';

        -- Configure default settings for the user (good practice)
        ALTER ROLE resume_insider SET client_encoding TO 'utf8';
        ALTER ROLE resume_insider SET default_transaction_isolation TO 'read committed';
        ALTER ROLE resume_insider SET timezone TO 'UTC';

        -- Grant all privileges on the database to the new user
        GRANT ALL PRIVILEGES ON DATABASE resume_insider TO resume_insider;
        ```
    3.  **Set Environment Variables:** Configure your Django project to connect to PostgreSQL by setting these environment variables in your shell *before* running the Django server or Celery worker.
        ```bash
        export DB_NAME="resume_insider"
        export DB_USER="resume_insider"
        export DB_PASSWORD="YOUR_CHOSEN_PASSWORD"
        export DB_HOST="localhost" # Or your PostgreSQL host
        export DB_PORT="5432"      # Or your PostgreSQL port
        ```
    4.  Run migrations:
        ```bash
        pipenv run python manage.py migrate
        ```

#### c. Set Gemini API Key

The application integrates with the Google Gemini API for summarization. You need to obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

Set your Gemini API key as an environment variable:

```bash
export GEMINI_API_KEY='YOUR_GEMINI_API_KEY_HERE'
```

OR set it in the .env file
```env
GEMINI_API_KEY='YOUR_GEMINI_API_KEY_HERE'
```

#### d. Run Redis (Message Broker)

The project uses Redis as a message broker for Celery. The easiest way to run Redis is using Docker:

```bash
docker run -d -p 6379:6379 redis
```

#### e. Run Celery Worker

In a **separate terminal window**, start the Celery worker. This process will handle the asynchronous PDF processing and AI calls.

```bash
pipenv run celery -A resume_insider worker -l info
```

#### f. Run Django Development Server

In another **separate terminal window**, start the Django development server:

```bash
pipenv run python manage.py runserver
```

### 3. Frontend Setup

Navigate to the `frontend` directory:

```bash
cd frontend
```

#### a. Install Node.js Dependencies

```bash
npm install
```

#### b. Configure Frontend Environment

Create a `.env` file in the `frontend` directory (at the same level as `package.json`) and add your backend API base URL:

```
VITE_API_BASE_URL=http://127.0.0.1:8000/
```

#### c. Run Frontend Development Server

```bash
npm run dev
```

This will typically start the React app on `http://localhost:5173`.

## API Endpoints

The backend exposes the following key API endpoints:

*   **Authentication:**
    *   `POST /api/auth/users/`: Register a new user.
        *   **Requires:** `email`, `username`, `password`, `password2` (confirm password).
    *   `POST /api/auth/jwt/create/`: Obtain JWT access and refresh tokens (login).
        *   **Requires:** `username`, `password`.
    *   `POST /api/auth/jwt/refresh/`: Refresh an expired access token using a refresh token.
*   **Document Management:**
    *   `POST /api/upload-resume/`: Upload a PDF resume for processing.
        *   **Requires:** `file` (multipart/form-data).
        *   **Authentication:** JWT Bearer Token in `Authorization` header.
    *   `GET /api/history/`: Retrieve a list of all uploaded documents and their insights for the authenticated user.
        *   **Authentication:** JWT Bearer Token in `Authorization` header.

## Architectural and Design Decisions

### Backend (Django)

*   **Modular App Structure:** The project is divided into logical Django apps (`core`, `api`, `documents`, `insights`) to promote separation of concerns, maintainability, and scalability.
    *   `core`: Handles core user model and general project settings.
    *   `documents`: Manages PDF file storage and metadata.
    *   `insights`: Manages the AI-generated summaries and fallback data.
    *   `api`: Contains the REST API views, serializers, and URL routing.
*   **Asynchronous Processing with Celery:** PDF processing and AI calls are computationally intensive and time-consuming. By offloading these tasks to Celery workers, the API remains responsive, preventing timeouts and improving user experience. Redis serves as the message broker for task queuing.
*   **JWT Authentication with Djoser:** Provides a secure, stateless, and scalable authentication mechanism for the API. Djoser simplifies common authentication flows (registration, login) while `djangorestframework-simplejwt` handles token creation and validation.
*   **Database Flexibility:** Configured for easy switching between SQLite (development) and PostgreSQL (production) by leveraging environment variables.
*   **Robust AI Integration:** Designed with a clear fallback mechanism. If the primary AI (Gemini) fails or hits rate limits, the system gracefully degrades to provide the top 5 most frequent words from the document.

### Frontend (React)

*   **Separation of Concerns:** The React application resides in a dedicated `frontend/` directory, allowing independent development, testing, and deployment from the Django backend.
*   **Modern Tooling:** Utilizes Vite for fast development server and optimized builds.
*   **Component-Based UI:** Built with React, promoting reusable UI components and a clear component hierarchy.
*   **Material-UI (MUI):** Chosen for its comprehensive set of pre-built, accessible, and customizable UI components, enabling rapid development of a responsive and modern user interface.
*   **Client-Side Routing:** `react-router-dom` manages navigation within the single-page application, providing a smooth user experience.
*   **Authentication Flow:** Integrates with the backend's JWT authentication, managing token storage (in `localStorage`) and providing an `AuthContext` for global authentication state management. Protected routes ensure only authenticated users can access certain parts of the application.
*   **Dynamic Content Display:** The History page dynamically updates document statuses and renders AI summaries using `react-markdown` for proper formatting.

## Reflections on Challenges and Alternative Approaches

### Challenges Encountered

*   **Celery Setup and Task Discovery:** Initial difficulties arose with Celery worker not discovering tasks due to file naming conventions (`services.py` vs. `tasks.py`) and ensuring the worker was correctly restarted after configuration changes.
*   **Frontend Rendering Issues:** Debugging initial blank page issues in React, which were traced to conflicting default CSS and subtle JSX syntax errors. This highlighted the importance of careful component structuring and understanding Material-UI's styling expectations.
*   **CORS Configuration:** A common hurdle in full-stack development, requiring correct installation and middleware placement of `django-cors-headers`.
*   **Djoser/SimpleJWT Integration:** Ensuring the `LOGIN_FIELD` and custom serializer settings were correctly propagated through Djoser and SimpleJWT's configurations proved challenging, requiring explicit mapping of serializers.
*   **API Rate Limiting:** Encountering Gemini API rate limits on the free tier necessitated implementing a fallback mechanism and exploring alternative models (`gemini-1.5-flash`) or strategies like exponential backoff (though not fully implemented).
*   **File Pathing and Environment Variables:** Managing environment variables across both backend (Django `settings.py`) and frontend (Vite `.env`) required careful attention to ensure correct values were accessed in different environments.

### Alternative Approaches

*   **Backend Frameworks:**
    *   **Flask/FastAPI:** Could have been used instead of Django for a more lightweight API, but Django's ORM, Admin, and built-in features accelerate development for larger applications.
*   **Frontend Frameworks/Libraries:**
    *   **Vue.js/Angular:** Other popular choices for single-page applications, offering different paradigms for component development and state management.
    *   **Next.js:** A React framework that could provide server-side rendering (SSR) or static site generation (SSG) benefits, potentially improving initial load times and SEO, but adding complexity.
*   **Asynchronous Task Queues:**
    *   **Django-Q:** A simpler, database-backed task queue for Django, potentially easier to set up than Celery for smaller projects.
    *   **Direct Threading/Multiprocessing:** Could be used for very simple background tasks, but lacks the robustness, monitoring, and scalability of Celery.
*   **AI Models:**
    *   **Other LLMs:** Integration with OpenAI's GPT models, Anthropic's Claude, or open-source models (e.g., Llama 2) could be explored.
    *   **Self-hosted Models:** For privacy or specific performance needs, fine-tuned models could be hosted locally or on private cloud infrastructure.
*   **Authentication:**
    *   **Session-based Authentication:** Simpler for traditional web applications but less suitable for decoupled APIs.
    *   **OAuth 2.0:** For more complex authorization flows involving third-party services.
*   **Database:**
    *   **MySQL/MariaDB:** Other relational database options.
    *   **MongoDB/NoSQL:** For schema-less data storage, if the data structure were less rigid.

