# Cyclying-Club-Management-Web-App

This is a complete system for managing a cycling club, enabling the administration of members, events, and event registrations. The application uses Node.js with Express for the backend and a **MySQL** database for data persistence.

## 📋 Description

The application allows:

- **Member Management**: Add, edit, and remove club members.
- **Event Management**: Create, update, and delete cycling events.
- **Event Registration**: Members can register or unregister for events.
- **Dynamic Web Interface**: Built using HTML, CSS, and pure JavaScript (avoiding `innerHTML`), following modern security practices.

The project follows a route-based architecture with a clear separation between frontend and backend logic.

## 🛠️ Features

- **REST API**: Implements RESTful services using Express, enabling full CRUD operations for members, events, and event types.
- **Relational Database**: Uses MySQL to efficiently store structured data.
- **Responsive Frontend**: Developed using HTML, CSS, and ES6 JavaScript.
- **Data Validation**: Performed both client-side and server-side.

## 🏗️ Project Structure

```
Project/
├── database/            # SQL scripts and MySQL inserts
├── docs/                # JavaDocs and documentation
├── node_modules/        # Node.js dependencies
├── routes/              # Express route files (events, members, event types)
│   ├── eventRoutes.js
│   ├── eventTypesRoutes.js
│   └── membersRoutes.js
├── scripts/             # Backend configuration scripts
│   ├── connection-options.js
│   └── db.js
├── www/                 # Frontend files
│   ├── images/          # Images used in the frontend
│   ├── scripts/
│   │   └── app.js       # Main frontend logic
│   └── styles/
│   │   └── styles.css   # Main stylesheet
│   └──index.html        # Main frontend file
├── index.js             # Main entry point (Express server)
└── README.md            # This file :)
```

## 🧰 Technologies Used

- **Backend**: Node.js with Express.js
- **Database**: MySQL
- **Frontend**: HTML5, CSS3, JavaScript (ES6)
- **Others**: Fetch API, DOM API (`createElement`, `appendChild`, etc.)

## 🚀 Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/guiram0s/Cyclying-Club-Management-Web-App.git
   cd Cyclying-Club-Management-Web-App/Project
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up the Database**:
   - Create the MySQL database and import the SQL scripts from the `database/` directory.
   - Update the connection file (e.g., `db.js`) with your credentials:
     ```js
     const connection = mysql.createConnection({
       host: 'localhost',
       user: 'root',
       password: '',
       database: 'cycling_club_db'
     });
     ```

4. **Start the Server**:
   ```bash
   node index.js run
   ```

5. **Start the Frontend**:

   If you are using VSCode, install the Live Server extension and open `index.html` in the browser using Go Live (bottom right).
   Otherwise, just navigate to `index.html` using a local server or your browser with the correct path.

## 📌 Main REST Endpoints

- `GET /api/members` — List members
- `POST /api/members` — Add a member
- `PUT /api/members/:id` — Edit a member
- `DELETE /api/members/:id` — Delete a member
- `GET /api/events` — List events
- `POST /api/registrations` — Register for an event
- etc.

## 🛡️ Security

- **No use of `innerHTML`**: Prevents XSS injections.
- **Input validation** on the backend.
- **RESTful structure** separates data and presentation layers.

## 👤 Author

Developed by [@guiram0s](https://github.com/guiram0s)

