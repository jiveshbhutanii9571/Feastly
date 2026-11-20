import os
import re
import sqlite3
import secrets
from datetime import datetime, timezone
from functools import wraps

from flask import Flask, jsonify, request, session, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "feastly.db")
app = Flask(__name__, static_folder=None)
app.secret_key = os.environ.get("FEASTLY_SECRET_KEY") or secrets.token_hex(32)
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=os.environ.get("FEASTLY_HTTPS", "0") == "1",
    PERMANENT_SESSION_LIFETIME=60 * 60 * 24 * 7,
)

MENU = {
    1: ("Classic Cheeseburger", 199), 2: ("Double Smash Burger", 279),
    3: ("Margherita Pizza", 249), 4: ("Farmhouse Pizza", 329),
    5: ("Paneer Butter Masala", 259), 6: ("Veg Biryani", 219),
    7: ("Butter Paneer Dosa", 199), 8: ("Cold Coffee", 119),
    9: ("Fresh Lime Soda", 79), 10: ("Loaded French Fries", 129),
    11: ("Chocolate Brownie", 149), 12: ("Chole Bhature", 179),
    13: ("Creamy Fettuccine Alfredo", 299), 14: ("Molten Lava Cake", 189),
    15: ("Sizzling Street Tacos", 229), 16: ("Classic Chole Bhature", 189),
    17: ("Paneer Masala Dosa", 199), 18: ("Paneer Biryani", 249),
}

def connect_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with connect_db() as db:
        db.execute("""CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )""")
        db.execute("""CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            customer_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            address TEXT NOT NULL,
            payment_method TEXT NOT NULL,
            instructions TEXT NOT NULL DEFAULT '',
            items_json TEXT NOT NULL,
            subtotal INTEGER NOT NULL,
            delivery_fee INTEGER NOT NULL,
            platform_fee INTEGER NOT NULL,
            gst INTEGER NOT NULL,
            total INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )""")
        columns = {row[1] for row in db.execute("PRAGMA table_info(orders)")}
        if "status" not in columns:
            db.execute("ALTER TABLE orders ADD COLUMN status TEXT NOT NULL DEFAULT 'Placed'")

def user_public(row):
    return {"id": row["id"], "name": row["name"], "email": row["email"]}

def login_required(fn):
    @wraps(fn)
    def wrapped(*args, **kwargs):
        if not session.get("user_id"):
            return jsonify(error="Please log in to continue."), 401
        return fn(*args, **kwargs)
    return wrapped

@app.get("/")
def home():
    return send_from_directory(BASE_DIR, "index.html")

@app.get("/<path:path>")
def static_files(path):
    # Only serve project files, including CSS, JS, and food assets.
    full = os.path.abspath(os.path.join(BASE_DIR, path))
    if not full.startswith(os.path.abspath(BASE_DIR) + os.sep) or not os.path.isfile(full):
        return jsonify(error="Not found"), 404
    return send_from_directory(BASE_DIR, path)

@app.get("/api/me")
def me():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify(user=None)
    with connect_db() as db:
        row = db.execute("SELECT id, name, email FROM users WHERE id=?", (user_id,)).fetchone()
    if not row:
        session.clear()
        return jsonify(user=None)
    return jsonify(user=user_public(row))

@app.post("/api/register")
def register():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    if len(name) < 2 or len(name) > 80:
        return jsonify(error="Please enter a name (2–80 characters)."), 400
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        return jsonify(error="Please enter a valid email address."), 400
    if len(password) < 8:
        return jsonify(error="Password must be at least 8 characters."), 400
    try:
        with connect_db() as db:
            cur = db.execute(
                "INSERT INTO users(name,email,password_hash,created_at) VALUES(?,?,?,?)",
                (name, email, generate_password_hash(password), datetime.now(timezone.utc).isoformat())
            )
            user_id = cur.lastrowid
            row = db.execute("SELECT id,name,email FROM users WHERE id=?", (user_id,)).fetchone()
    except sqlite3.IntegrityError:
        return jsonify(error="This email is already registered. Please log in."), 409
    session.clear()
    session["user_id"] = user_id
    session.permanent = True
    return jsonify(user=user_public(row)), 201

@app.post("/api/login")
def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    with connect_db() as db:
        row = db.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
    if not row or not check_password_hash(row["password_hash"], password):
        return jsonify(error="Incorrect email or password."), 401
    session.clear()
    session["user_id"] = row["id"]
    session.permanent = True
    return jsonify(user=user_public(row))

@app.post("/api/logout")
def logout():
    session.clear()
    return jsonify(message="Logged out successfully.")

@app.post("/api/orders")
@login_required
def create_order():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    phone = str(data.get("phone", "")).strip()
    address = str(data.get("address", "")).strip()
    payment = str(data.get("payment_method", "Cash on delivery (demo)"))[:60]
    instructions = str(data.get("instructions", "")).strip()[:500]
    items = data.get("items", [])
    if not name or not address or not re.fullmatch(r"[0-9 +()\-]{10,20}", phone):
        return jsonify(error="Please provide a name, valid phone number, and delivery address."), 400
    if not isinstance(items, list) or not items:
        return jsonify(error="Your cart is empty."), 400
    clean_items = []
    subtotal = 0
    for item in items:
        try:
            item_id, qty = int(item["id"]), int(item["quantity"])
        except (KeyError, TypeError, ValueError):
            return jsonify(error="Invalid cart item."), 400
        if item_id not in MENU or qty < 1 or qty > 50:
            return jsonify(error="Invalid item or quantity."), 400
        title, price = MENU[item_id]
        clean_items.append({"id": item_id, "name": title, "price": price, "quantity": qty})
        subtotal += price * qty
    delivery = 0 if subtotal >= 499 else 30
    platform = 5
    gst = round(subtotal * 0.05)
    total = subtotal + delivery + platform + gst
    with connect_db() as db:
        cur = db.execute("""INSERT INTO orders
            (user_id,customer_name,phone,address,payment_method,instructions,items_json,
             subtotal,delivery_fee,platform_fee,gst,total,created_at)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (session["user_id"], name, phone, address, payment, instructions,
             __import__("json").dumps(clean_items), subtotal, delivery, platform, gst, total,
             datetime.now(timezone.utc).isoformat()))
        order_id = cur.lastrowid
    return jsonify(order_id=f"FST{order_id:06d}", total=total, message="Order saved. Payment is still demo-only."), 201

@app.get("/api/orders")
@login_required
def my_orders():
    with connect_db() as db:
        rows = db.execute(
            "SELECT id, customer_name, items_json, total, created_at, status FROM orders WHERE user_id=? ORDER BY id DESC",
            (session["user_id"],)
        ).fetchall()
    import json
    return jsonify(orders=[{"order_id": f"FST{r['id']:06d}", "customer_name": r["customer_name"],
                            "items": json.loads(r["items_json"]), "total": r["total"],
                            "created_at": r["created_at"], "status": r["status"]} for r in rows])


@app.post("/api/orders/<int:order_id>/cancel")
@login_required
def cancel_order(order_id):
    with connect_db() as db:
        row = db.execute("SELECT status FROM orders WHERE id=? AND user_id=?", (order_id, session["user_id"])).fetchone()
        if not row:
            return jsonify(error="Order not found."), 404
        if row["status"] == "Cancelled":
            return jsonify(message="This order is already cancelled.", status="Cancelled")
        created = db.execute("SELECT created_at FROM orders WHERE id=? AND user_id=?", (order_id, session["user_id"])).fetchone()
        try:
            placed_at = datetime.fromisoformat(created["created_at"])
            if placed_at.tzinfo is None:
                placed_at = placed_at.replace(tzinfo=timezone.utc)
            elapsed_minutes = (datetime.now(timezone.utc) - placed_at.astimezone(timezone.utc)).total_seconds() / 60
        except (TypeError, ValueError):
            elapsed_minutes = 0
        if elapsed_minutes >= 45:
            return jsonify(error="This order can no longer be cancelled because the 45-minute delivery window has ended."), 400
        db.execute("UPDATE orders SET status='Cancelled' WHERE id=? AND user_id=?", (order_id, session["user_id"]))
    return jsonify(message="Order cancelled successfully.", status="Cancelled")

init_db()

if __name__ == "__main__":
    print("Feastly backend is running at http://127.0.0.1:5000")
    print("Keep this terminal open while using the website. Press Ctrl+C to stop.")
    app.run(host="127.0.0.1", port=5000, debug=False)
