# 🚀 QueueLess

QueueLess is a full-stack MERN application that digitizes traditional waiting lines by allowing customers to join queues remotely while enabling businesses to manage queues efficiently through a real-time dashboard.

The platform eliminates physical waiting, provides live queue tracking, estimates waiting time, and synchronizes queue updates instantly using Socket.IO.

---

## 🌐 Live Demo



---

# ✨ Features

## 👤 Customer

- Secure registration and login using JWT Authentication
- Browse all available businesses
- Join an active queue
- Receive a unique digital token
- View:
  - Current queue position
  - Current serving token
  - Estimated waiting time
  - Queue status
- Prevent duplicate active queue entries
- Receive live queue updates without refreshing the page

---

## 🏪 Business Owner

- Register as a business owner
- Create and manage a business
- Open and close customer queues
- View the live customer queue
- Serve the next customer
- Monitor:
  - Waiting customers
  - Served customers
  - Current token
- Real-time dashboard updates using Socket.IO

---

# 🛠️ Tech Stack

## Frontend

- React.js
- Vite
- React Router
- CSS
- Socket.IO Client

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt.js
- Socket.IO

## Deployment

- Vercel (Frontend)
- Render (Backend)
- MongoDB Atlas

---





# 🏗️ Project Structure

```
QueueLess
│
├── client
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   ├── hooks
│   │   └── ...
│   │
│   └── ...
│
├── server
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── socket
│   ├── utils
│   └── ...
│
└── README.md
```

---

# 🔄 Application Workflow

```
Owner registers
        │
        ▼
Create Business
        │
        ▼
Open Queue
        │
        ▼
Customer joins queue
        │
        ▼
Digital token generated
        │
        ▼
Estimated wait calculated
        │
        ▼
Real-time queue updates
        │
        ▼
Owner serves customer
        │
        ▼
Queue updates instantly
```

---

# ⚡ Real-Time Architecture

```
                Customer
                    │
                    │
             Socket.IO Client
                    │
────────────────────────────────────
                    │
          Express + Node.js Server
                    │
             Socket.IO Broadcast
                    │
      ┌─────────────┴─────────────┐
      │                           │
 Business Owner              Other Customers
```

Events synchronized in real time:

- Customer joins queue
- Queue position updates
- Estimated wait updates
- Serve next customer
- Queue open/close status

---

# ⏱️ Estimated Wait Time

QueueLess estimates customer waiting time dynamically.

```
Estimated Wait

=

People Ahead × Average Service Time
```

Each business maintains an average service time, allowing customers to receive a realistic estimate immediately after joining the queue.

The estimate automatically updates whenever the queue changes.

---

# 🗄️ Database Models

## User

```javascript
{
    name,
    email,
    password,
    role
}
```

---

## Business

```javascript
{
    name,
    code,
    ownerId,
    queueOpen,
    currentToken,
    averageServiceTime
}
```

---

## Queue

```javascript
{
    businessId,
    customers:[
        {
            customerId,
            tokenNumber,
            status,
            joinedAt
        }
    ]
}
```

---

# 🔐 Security

- JWT Authentication
- Password hashing using bcrypt
- Protected API routes
- Owner-only queue management
- Business ownership verification
- Duplicate active queue prevention
- Secure authorization middleware

---

# ⚙️ Engineering Decisions

### Role-Based Authentication

Customers and business owners have separate permissions enforced through JWT authentication and backend authorization middleware.

---

### Owner Isolation

Each owner can only access and manage their own business.

Backend ownership checks prevent unauthorized queue management.

---

### Duplicate Queue Prevention

Customers can hold only one active queue token per business.

This prevents accidental duplicate entries while still allowing users to rejoin after being served.

---

### Dynamic Wait-Time Estimation

Estimated wait time is calculated dynamically using queue position and each business's average service time rather than storing static values.

---

### Real-Time Synchronization

Socket.IO broadcasts queue updates instantly so all connected users receive live changes without manually refreshing the application.

---

### Single Source of Truth

Queue state is derived from customer statuses instead of maintaining multiple synchronized lists, reducing data inconsistency.

---

# 📡 REST API

## Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Register User |
| POST | `/api/auth/login` | Login User |

---

## Business

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/business` | Get Approved Businesses |
| GET | `/api/business/my-business` | Get Owner's Business |
| POST | `/api/business` | Create Business |
| PATCH | `/api/business/:id/open` | Open Queue |
| PATCH | `/api/business/:id/close` | Close Queue |

---

## Queue

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/queue/:businessId/join` | Join Queue |
| GET | `/api/queue/:businessId/status` | Customer Queue Status |
| GET | `/api/queue/:businessId` | Live Queue |
| PATCH | `/api/queue/:businessId/serve` | Serve Next Customer |

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/Akanksha-Singh27/QueueLess.git

cd QueueLess
```

---

## Install Dependencies

### Frontend

```bash
cd client

npm install
```

### Backend

```bash
cd server

npm install
```

---

## Run Locally

### Backend

```bash
npm start
```

### Frontend

```bash
npm run dev
```

---

# ⚙️ Environment Variables

Create a `.env` file inside the **server** directory.

```env
PORT=5001

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

---

# 🚀 Future Improvements

- QR code-based queue joining
- SMS/Email notifications
- Multiple service counters
- Queue analytics dashboard
- Appointment scheduling
- Customer feedback and ratings
- Business operating hours
- Push notifications

---

# 👩‍💻 Contributors

**Akanksha Singh**

B.Tech Electronics & Communication Engineering

Indira Gandhi Delhi Technical University for Women (IGDTUW)

GitHub: https://github.com/Akanksha-Singh27

LinkedIn: https://www.linkedin.com/in/akanksha-singh-858020327/

**Ananya Satyapal**
- GitHub: https://github.com/...
- LinkedIn: https://linkedin.com/in/...

**Sneha Pandey**
- GitHub: https://github.com/snehap27
- LinkedIn: https://linkedin.com/in/snehapandey27/

---

## ⭐ If you found this project useful, consider giving it a star!
