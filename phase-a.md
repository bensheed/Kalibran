# Kalibran - Phase A Development Plan

This document outlines the detailed logical steps to execute on the Product Requirements Document (PRD) for Kalibran - Phase A.

### Core Architectural Principles
- **Single Docker Container:** The entire application (frontend and backend) will be served from a single Docker container to keep the architecture lean. The backend will serve the compiled frontend assets.
- **Monorepo Structure:** Both frontend and backend code will live in the same repository for simplified management.
- **Database-First:** The database schema will be the foundation, defined and created early in the process.

---

### Step 1: Project Initialization and Setup

1.  **Directory Structure:** Create the initial project structure.
    ```
    /Kalibran
    |-- /src
    |   |-- /backend
    |   |   |-- /controllers
    |   |   |-- /routes
    |   |   |-- /services
    |   |   |-- /models
    |   |   |-- index.ts
    |   |-- /frontend
    |       |-- /src
    |       |-- package.json
    |-- /database
    |   |-- init.sql
    |-- Dockerfile
    |-- package.json
    |-- tsconfig.json
    ```
2.  **Initialize Project:** Run `npm init` at the root.
3.  **Install Dependencies:**
    -   **Backend (in `/`):** `npm install express typescript ts-node pg mssql socket.io bcrypt` and dev dependencies `@types/express @types/node @types/pg @types/bcrypt`.
    -   **Frontend (in `/src/frontend`):** Use `npx create-react-app frontend --template typescript` to bootstrap the React app.
4.  **TypeScript Configuration:** Create a root `tsconfig.json` to manage compilation for the backend.

---

### Step 2: Database Schema and Setup

1.  **Create `init.sql`:** In `database/init.sql`, write the SQL statements to create the necessary tables.
    -   **`settings`**: To store global settings.
        -   `setting_key` (PK), `setting_value` (to store admin PIN, sync frequency, outlier thresholds, inactivity timeout for auto-scrolling).
    -   **`users`**: A simple table for user roles, laying the foundation for future multi-user support.
        -   `id` (PK), `username`, `pin_hash`, `role` ('admin' or 'tech').
    -   **`boards`**: To define Kanban boards.
        -   `id` (PK), `name`, `card_layout_config` (JSONB to store which columns from `raw_sync_data` are visible on cards).
    -   **`columns`**: To define the columns for each board.
        -   `id` (PK), `board_id` (FK), `name`, `column_order`, `filter_rules` (JSONB).
    -   **`raw_sync_data`**: A single table to store the joined and filtered data from ProCal. The columns will be dynamic based on the user's query setup, but will include `Inst_ID` and `Job_no`.
    -   **`kanban_cards_view`**: Create a PostgreSQL VIEW on `raw_sync_data` to act as a clean, performant data source for the frontend, decoupling it from the raw storage table.
    -   **`column_transitions`**: To track card movement and time-in-column.
        -   `id` (PK), `job_no` (FK), `inst_id`, `column_id` (FK), `entered_at`, `exited_at`, `sequence_number`, `is_outlier` (boolean).
    -   **`prediction_models`**: To store serialized machine learning models and their metadata. This will be created in Phase A to lay the foundation for forecasting features in Phase B.
        -   `id` (PK), `tenant_id` (FK), `model_name`, `model_data` (BYTEA), `created_at`.

---

### Step 3: Backend Development - Core Services

1.  **Setup Express Server (`src/backend/index.ts`):**
    -   Create a basic Express server.
    -   Implement middleware for JSON parsing and CORS.
    -   Add a check to see if the application has been set up (e.g., if an admin PIN exists in the `settings` table). If not, redirect to a setup page.
2.  **First-Time Setup & Authentication:**
    -   Create a route and controller for the initial setup process. This will render a page where the user sets the 4-digit admin PIN.
    -   Hash the PIN using `bcrypt` before storing it.
    -   Create authentication middleware to protect admin-only routes. It will check for a valid session/token that is granted after a successful PIN entry.
3.  **Database Connection Service:**
    -   Create a service to manage the connection pool to the PostgreSQL database.
4.  **Sync Service:**
    -   Create a service to handle the connection to the external SQL Server (ProCal).
    -   Implement the logic to execute the user-defined `JOIN` query. This must join "Calibrations" and "Instruments" on `Inst_ID` and select the row with the highest `Job_no` for each instrument.
    -   The results will be stored in the `raw_sync_data` table.
    -   Create an API endpoint to trigger a manual sync.

---

### Step 4: Backend Development - API Endpoints

1.  **Boards API:**
    -   `GET /api/boards`: List all boards.
    -   `POST /api/boards`: Create a new board (admin only).
    -   `GET /api/boards/:id`: Get details for a single board, including its columns and cards (using the `kanban_cards_view`).
    -   `PUT /api/boards/:id`: Update board settings, including the `card_layout_config`.
2.  **Columns API:**
    -   `POST /api/columns`: Add a column to a board (admin only).
    -   `PUT /api/columns/:id`: Update a column's name, order, or filter rules (admin only).
    -   The filter rules will be translated into a SQL `WHERE` clause with `AND`, `OR`, and `IS NOT` capabilities to query the `raw_sync_data` table.
3.  **Cards API (Card Movement):**
    -   `PUT /api/cards/:job_no/move`: The primary endpoint for lab techs. It will take a `new_column_id`.
    -   **Logic:**
        1.  Find the last entry for the card in `column_transitions` and set `exited_at`.
        2.  Create a new entry in `column_transitions` with the `new_column_id`, a new `entered_at` timestamp, and the correct `sequence_number`.
4.  **Settings API:**
    -   `GET /api/settings`: Retrieve all global settings.
    -   `PUT /api/settings`: Update global settings (admin only).
5.  **WebSocket Foundation:**
    -   Integrate Socket.io with the Express server.
    -   Set up the basic connection handling, but do not implement the real-time data push in Phase A. This prepares the foundation for Phase B.

---

### Step 5: Frontend Development

1.  **Routing:** Use `react-router-dom` to set up routes for:
    -   `/setup`: The initial admin PIN setup page.
    -   `/login`: The PIN entry page for accessing admin features.
    -   `/board/:boardName`: The main Kanban board view.
2.  **First-Time Setup UI:**
    -   The setup page must include a dropdown for selecting the external database, with "MetCal" and "IndySoft" greyed out.
3.  **Kanban Board UI:**
    -   Create a `Board` component that fetches data from `/api/boards/:id`.
    -   Render `Column` components dynamically based on the fetched data.
    -   Render `Card` components within the appropriate columns, with fields dynamically displayed based on the board's `card_layout_config`.
    -   Implement drag-and-drop functionality for cards between columns using a library like `react-beautiful-dnd`. Dropping a card will call the `PUT /api/cards/:job_no/move` endpoint.
    -   **Remember Last Board:** Use `localStorage` to store the ID of the last viewed board and automatically navigate to it on subsequent visits.
    -   **Interface Scaling:**
        -   Implement controls on the board UI for lab techs to manually adjust the scale of the board and cards.
        -   The board should dynamically scale as the number of cards and columns change.
    -   **Column Features:**
        -   Each column must be individually scrollable.
        -   Implement a sort feature for each column.
        -   After a configurable period of inactivity (fetched from `GET /api/settings`), columns will automatically scroll back to the top.
4.  **Settings UI (Admin Only):**
    -   Create UI for managing boards and columns.
    -   Build the interface for configuring column filters, allowing the user to define rules with "AND", "OR", and "IS NOT" logic.
    -   **Card Layout Editor:**
        -   Create a UI where admins can see a list of available fields from the synced data and use checkboxes or a drag-and-drop interface to select and order them for display on the Kanban cards. This configuration will be saved via the `PUT /api/boards/:id` endpoint.
    -   **Global Settings:**
        -   Develop a form to update values for sync frequency, inactivity timeout, and outlier detection thresholds.
        -   Include a tooltip next to the outlier setting to explain its purpose as required by the PRD.
5.  **State Management:** Use a state management library (like Zustand or Redux Toolkit) to handle the board state and user authentication status.
6.  **Error Handling:**
    -   When the external SQL Server is unreachable, display a clear error message on the screen.
    -   The error message should include a button that navigates the user to the settings page.
7.  **Styling:**
    -   Implement the specified color scheme:
        -   **Primary:** `#d5d7d9` (off-white)
        -   **Dark Grey:** `#2e3941`
        -   **Medium Grey:** `#586167`
        -   **Blue:** `#314C9F`

---

### Step 6: Dockerization

1.  **Create `Dockerfile`:**
    -   Use a multi-stage build.
    -   **Stage 1 (Frontend Build):** Use a `node` image, copy the `frontend` source, install dependencies, and run the build script to generate static assets.
    -   **Stage 2 (Backend Build):** Use a `node` image, copy the `backend` source, install dependencies, and compile the TypeScript to JavaScript.
    -   **Stage 3 (Final Image):** Use a lean `node` image (e.g., `node:18-alpine`). Copy the compiled backend from Stage 2 and the static frontend assets from Stage 1.
    -   The `CMD` will be `["node", "src/backend/index.js"]`.
    -   The Express server will be configured to serve the static files from the frontend build directory.
