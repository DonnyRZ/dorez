# FocusApp

FocusApp is a cross-platform desktop application designed to help users manage their daily goals and tasks, prioritizing high-value activities ("signal") over distractions ("noise"). Built with Electron, it leverages web technologies for the frontend and a Python backend for local task relevance scoring using the Ollama API.

## Quick Start

To get started with FocusApp, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/DonnyRZ/focusApp.git
    cd focusApp
    ```

2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

3.  **Set up the Python backend:**
    Navigate to the `Backend` directory and install the required Python packages. It is recommended to use a virtual environment.
    ```bash
    cd Backend
    pip install -r requirements.txt # Assuming a requirements.txt exists or create one with flask and requests
    ```
    Ensure you have Ollama installed and running with the Qwen 3 0.6 billion parameter model.

4.  **Start the application:**
    From the root directory of the project:
    ```bash
    npm start
    ```
    This will launch the Electron application and the Python backend.

## Folder Structure

The project is organized into the following main directories:

```
.
├── Backend/
│   ├── main.py             # Flask application for task scoring
│   ├── ollama_client.py    # Handles communication with Ollama API
│   └── ...                 # Other backend-related files (e.g., tests)
├── Frontend/
│   ├── data-store.js       # Manages local data storage
│   ├── event-listeners.js  # Handles UI event listeners
│   ├── goal-manager.js     # Manages goal-related logic
│   ├── index.html          # Main HTML file for the user interface
│   ├── main-renderer.js    # Main renderer process entry point
│   ├── styles.css          # Application styling
│   ├── task-manager.js     # Manages task-related logic
│   ├── ui-manager.js       # Manages UI updates and screen transitions
│   └── utils.js            # Utility functions
├── main-process/
│   ├── ipc-handlers.js     # IPC communication between main and renderer processes
│   ├── menu.js             # Application menu definition
│   ├── scoring/            # Modules related to task scoring
│   │   ├── data-manager.js
│   │   ├── notification-manager.js
│   │   ├── scoring-queue.js
│   │   └── scoring-service.js
│   └── window.js           # Main window creation
├── .git/                   # Git version control files
├── appGoal.txt             # Detailed application description
├── focusapp-data.json      # Local data storage file
├── main.js                 # Electron main process entry point
├── package.json            # Project metadata and dependencies
├── package-lock.json       # Locked dependencies
└── README.md               # This file
```

## Key Features

*   **Cross-Platform Desktop Application:** Built with Electron, providing a native desktop experience on Windows, macOS, and Linux.
*   **Goal and Task Management:** Users can set daily goals and add tasks associated with them.
*   **Ollama Integration for Task Scoring:** Utilizes a local Ollama instance (Qwen 3 0.6 billion parameter model) to score the relevance of tasks to a given goal.
*   **Local Data Storage:** All application data, including goals and tasks, is stored locally in a JSON file (`focusapp-data.json`).
*   **Intuitive User Interface:** A clean and touch-friendly GUI built with HTML, CSS, and JavaScript, designed for minimal text input.
*   **Task Prioritization:** Helps users identify and focus on high-value tasks by flagging low-scoring tasks as "noise."
*   **Notifications:** Provides system notifications for task scoring results.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
