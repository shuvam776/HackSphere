# 🚀 JalRakshak Health AI  
### Smart Health Surveillance & Disease Early Warning System

---

## 📌 Overview

**JalRakshak Health AI** is an AI-powered health surveillance system designed to detect and predict water-borne disease outbreaks in rural and flood-prone regions.

The system integrates:
🧑‍⚕️ Field data from ASHA workers / volunteers  
🏭 Environmental & industrial data from admins  
🌍 Public datasets (rainfall, flood, disaster trends)

It uses machine learning (15-model benchmarking) to identify high-risk regions and generate early warning alerts.

---

## 🎯 Key Features

🧠 AI-based outbreak prediction (15 ML models)
🌊 Flood + rainfall + environmental intelligence
📍 Region/district-based filtering
👥 Role-based access system (ASHA / Admin / Public)
🗺️ Interactive dashboard with heatmaps
🚨 Real-time alert system
📴 Offline support (localStorage + sync)
🔁 Mock data fallback (demo-safe)

---

## 🏗️ System Architecture

![System Flow](./architecture.png)

---

## 👥 User Roles & Permissions

### 🟢 ASHA Workers / Volunteers
Login required  
Select multiple regions/districts  
Submit:
  - fever  
  - diarrhea  
  - vomiting  
  - symptom_severity_score  
View only selected regions  
Offline support + sync  

---

### 🟡 Admin
Full system access  
Upload:
  - rainfall  
  - flood data  
  - industrial waste  
  - production/environmental data  
Monitor all regions  

---

### 🔵 Public Users
No data input  
View dashboard  
Toggle regions dynamically  
See alerts & trends  


---

## 🔄 End-to-End Data Flow
### Flow Breakdown

1. User submits data (ASHA/Admin)  
2. Backend validates input  
3. Data is preprocessed  
4. ML model predicts outbreak risk  
5. Risk stored in database  
6. Dashboard updates  
7. Alerts triggered if threshold exceeded  

---

## 🧠 Machine Learning Pipeline

### Models Used (15)

RandomForestClassifier ✅ (Primary)
XGBoost
LightGBM
CatBoost
ExtraTrees
GradientBoosting
HistGradientBoosting
AdaBoost
Bagging
Voting
Stacking
Logistic Regression
KNN
Naive Bayes
SVM

---

### Features Used

#### 🧪 Health Data
fever  
diarrhea  
vomiting  
symptom_severity_score  

#### 🌊 Environmental Data
rainfall  
flood_risk  
flood_frequency  
industrial_waste  
production_level  
sanitation_index  

#### ⏳ Temporal Data
year  
month  
season  

#### 📍 Location Data
location  
district  
location_numeric  
region_type  
population_density  

---

## 📊 Tech Stack

### Frontend
Next.js (TypeScript)
Tailwind CSS
Leaflet (Maps)
Chart.js / Recharts

### Backend
Flask (Python)
REST APIs
Flask-CORS

### Machine Learning
scikit-learn
XGBoost / LightGBM / CatBoost
Pandas / NumPy

### Database
SQLite

---

## 📡 API Endpoints

| Endpoint        | Method | Description |
|----------------|--------|------------|
| /report       | POST   | Submit health data |
| /reports      | GET    | Fetch reports |
| /alerts       | GET    | Fetch alerts |
| /bulk-upload  | POST   | Sync offline data |

---

## 🔌 Frontend ↔ Backend Integration
CORS enabled in Flask  
Proxy layer optional (Next.js API routes)  
Backend handles all logic  

---

## 📴 Offline Support

Stores data in localStorage  
Sync later via /bulk-upload  
Designed for low-connectivity rural areas  

---

## 🔁 Mock Data Fallback

If no data is available:
Ensures:
Demo never breaks  
UI always funct

ional  

---

## 🚨 Alert System

Triggered when:
## 📊 Dashboard Features

🗺️ Heatmap (Leaflet)
📈 Charts & trends
🔁 Region toggle
🚨 Alerts popup

---

## 🏆 Why This Project Stands Out

Combines health + environmental + geographic data  
Uses multi-source real-world datasets  
Implements 15-model benchmarking  
Offline-first rural design  
Role-based real-world architecture  
Scalable for government-level systems  

---

## 🧠 Key Insight
>Early detection prevents large-scale outbreaks.
---

## 🚀 Future Improvements

- T-based water quality sensors  
- vernment API integration  
- bile app for ASHA workers  
- me-series forecasting (LSTM)  

---

## 🧑‍💻 Team

Built for hackathon innovation 🚀  
Focus: Real-world impact + scalability  

---

## 📌 Final Pitch
> JlRakshak is a real-time, AI-powered, multi-source health intelligence system that predicts disease outbreaks in rural and flood-prone regions using environmental, temporal, and health data.
