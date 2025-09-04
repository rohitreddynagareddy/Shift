# Roster Genius - AI-Powered Scheduling Application

Roster Genius is a web application designed to demonstrate AI-powered employee shift scheduling. It features a Flask backend and a React frontend.

## Architecture Overview

This project uses a Python [Flask](https://flask.palletsprojects.com/) server for the backend API and a [React](https://react.dev/) frontend.

**Important Note on the Frontend:** The React frontend has been implemented using a **no-build-step, in-browser compilation** approach. This is an unconventional setup chosen specifically to work around a challenging and restrictive execution environment where standard Node.js build tools (`npm`, `yarn`, `vite`) were non-functional. It uses the [Babel Standalone](https://babeljs.io/docs/babel-standalone) library, loaded from a CDN, to transpile JSX directly in the browser. This setup is intended for demonstration purposes and is not a standard production architecture.

## Prerequisites

Before you begin, ensure you have the following installed:
- Python 3.8+
- `pip` (Python package installer)

## Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Create and activate a Python virtual environment:**
    - On macOS and Linux:
      ```bash
      python3 -m venv venv
      source venv/bin/activate
      ```
    - On Windows:
      ```bash
      python -m venv venv
      .\\venv\\Scripts\\activate
      ```

3.  **Install the required Python packages:**
    ```bash
    pip install -r requirements.txt
    ```

## Running the Application

1.  **Start the Flask Backend Server:**
    Once the setup is complete, run the following command from the root of the project directory:
    ```bash
    python3 main.py
    ```
    You should see output indicating that the Flask development server is running, similar to this:
    ```
     * Running on http://127.0.0.1:5001
    ```

2.  **Access the Application:**
    Open your web browser and navigate to the following URL:
    [http://127.0.0.1:5001](http://127.0.0.1:5001)

You should now see the Roster Genius application running. The frontend assets (HTML, CSS, and JavaScript/JSX files) are served directly by Flask, and the JSX is compiled in your browser.
