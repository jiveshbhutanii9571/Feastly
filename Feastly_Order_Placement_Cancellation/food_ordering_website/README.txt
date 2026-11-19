FEASTLY — FOOD ORDERING WEBSITE WITH PYTHON BACKEND

WHAT'S INCLUDED
- Frontend: index.html, style.css, script.js
- Backend: app.py (Flask)
- Database: SQLite (feastly.db is created automatically on first run)
- assets/: food photos
- Authentication: register, login, logout, hashed passwords, server-side session cookie
- Orders: signed-in users can save demo orders; order history is stored in SQLite

RUN ON WINDOWS
1. Install Python 3.10+ if it is not already installed.
2. Extract this ZIP into a folder.
3. Open that folder in File Explorer.
4. Click the address bar, type cmd, and press Enter.
5. Run these commands:

   py -m venv .venv
   .venv\Scripts\activate
   py -m pip install -r requirements.txt
   py app.py

6. Open http://127.0.0.1:5000 in Chrome or Edge.
7. Click Login in the website header to create an account or log in.
8. To stop the backend, go to the command window and press Ctrl+C.

IMPORTANT
- Do not open index.html directly for backend features. Use http://127.0.0.1:5000.
- Login and logout require the backend server to be running.
- User accounts and demo orders are stored in the local feastly.db SQLite file.
- Passwords are hashed; plain-text passwords are not stored.
- This is a local/student demo. Payment options are not connected to a real payment gateway.
- For a public production website, use HTTPS, a stable secret key, email verification, rate limiting, CSRF protection, secure deployment and a real payment provider.
