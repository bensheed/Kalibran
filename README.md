# Kalibran

Kalibran is a tool that reads data from calibration/asset management software and clones it into a PostgreSQL server. The data on this server is used to create a highly customizable Kanban board to promote efficiency in calibration and testing labs.

## Getting Started

### Prerequisites

- Docker
- Docker Compose
- Git

### Running the Application

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bensheed/Kalibran.git
   cd Kalibran
   ```

2. **Run the application:**
   - **On Windows:** Double-click the `launcher.bat` file.
   - **On macOS/Linux:** Open a terminal and run the following command:
     ```bash
     sh launcher.bat
     ```

3. **Access the application:**
   Open your web browser and navigate to `http://localhost:3001`.

4. **First-Time Setup:**
   On your first visit, you will be redirected to the setup page to configure the admin PIN and connect to your external database (e.g., ProCal).

## Updating the Application

To update the application to the latest version, first pull the latest changes from GitHub, and then run the `launcher.bat` file. This will rebuild the application containers without affecting your database.

## Tech Stack

- **Frontend:** React, TypeScript
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL
- **Containerization:** Docker, Docker Compose
