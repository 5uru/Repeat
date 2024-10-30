# Repeat

## Project Description

Repeat is an alternative to Anki, designed to be a native macOS application with a Python backend. The app is built using Tauri and features a modern UI implemented with shadcn UI components. The main purpose of Repeat is to help users create, manage, and review flashcards efficiently.

## Main Features

- Native macOS application
- Python backend using Flask
- Modern UI with shadcn UI components
- Create, manage, and review flashcards
- Sync flashcards with the backend

## Development Environment Setup

### Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn
- Tauri CLI

### Backend Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/5uru/Repeat.git
   cd Repeat/backend
   ```

2. Create a virtual environment and activate it:
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install the required dependencies:
   ```sh
   pip install -r requirements.txt
   ```

4. Run the Flask app:
   ```sh
   flask run
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```sh
   cd ../frontend
   ```

2. Install the required dependencies:
   ```sh
   npm install
   ```

3. Run the Tauri app:
   ```sh
   npm run tauri dev
   ```

## Building and Running the App

### Backend

1. Ensure the virtual environment is activated:
   ```sh
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

2. Run the Flask app:
   ```sh
   flask run
   ```

### Frontend

1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```

2. Build the Tauri app:
   ```sh
   npm run tauri build
   ```

3. Run the built app:
   ```sh
   ./src-tauri/target/release/bundle/macos/Repeat.app
   ```
