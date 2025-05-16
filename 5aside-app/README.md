# ⚽ 5-a-Side Poll App

This is a lightweight web app for managing weekly 5-a-side football attendance and tracking payments.

## 📦 Features

- Players enter their name and vote if they can play each week.
- Data is stored in Azure Cosmos DB via an Azure Function.
- Admins can see who’s in and calculate cost per player.
- Fully deployable to Azure Static Web Apps (free tier).

---

## 🧱 Tech Stack

- Frontend: React (client-side rendered)
- Backend: Azure Functions (JavaScript)
- Database: Azure Cosmos DB (MongoDB or Core API)
- Hosting: Azure Static Web Apps
- CI/CD: GitHub Actions (auto deploy on push to `main`)

---

## 🚀 Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/yourusername/5aside-poll.git
cd 5aside-poll
npm install
