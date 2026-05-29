🚀 JalRakshak Health AI
Smart Health Surveillance & Disease Early Warning System
📌 Overview
JalRakshak Health AI is an AI-powered health surveillance system designed to detect and predict water-borne disease outbreaks in rural and flood-prone regions.
The system collects real-time data from:
🧑‍⚕️ ASHA workers / volunteers
🏭 Admin (environmental & industrial data)
🌍 Public datasets (rainfall, flood, disaster trends)
It then uses machine learning (15-model benchmarking) to identify high-risk regions and generate early warning alerts.
🎯 Key Features
🧠 AI-based outbreak prediction (15 ML models)
🌊 Flood + rainfall + environmental integration
📍 Region-based data filtering
🧑‍🤝‍🧑 Role-based system (ASHA / Admin / Public)
🗺️ Interactive dashboard with heatmaps
🚨 Real-time alert system
📴 Offline support (localStorage + sync)
🔁 Mock data fallback (for reliability)
🏗️ System Architecture
👥 User Roles🟢 ASHA Workers / Volunteers
Submit health data:
fever
diarrhea
vomiting
symptom severity score
Select multiple districts/regions
View only their selected regions
Offline support + later sync
🟡 Admin
Full system access
Upload:
rainfall data
flood data
industrial waste
production data
Monitor all regions
🔵 Public Users
View dashboard only
Toggle regions dynamically
See outbreak insights & alerts
🔄 Data Flow
User Input → Next.js → API → Flask Backend → ML Model → DB → Dashboard → Alerts
Detailed Flow:
ASHA/Admin submits data
Data validated in backend
Preprocessed + feature engineered
ML model predicts outbreak risk
Risk score stored in DB
Dashboard updates
Alerts triggered if threshold exceeded
🧠 Machine Learning PipelineModels Used (15 total)
RandomForestClassifier ✅ (primary)
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
Features UsedHealth Data
fever
diarrhea
vomiting
symptom_severity_score
Environmental Data
rainfall
flood_risk
flood_frequency
industrial_waste
Temporal Data
year
month
season
Location Data
location
district
region_type
population_density
📊 Tech StackFrontend
Next.js (TypeScript)
Tailwind CSS
Leaflet (maps)
Chart libraries
Backend
Flask (Python)
REST APIs
CORS enabled
ML & Data
scikit-learn
XGBoost / LightGBM / CatBoost
Pandas / NumPy
Database
SQLite (hackathon optimized)
📡 API Endpoints

Endpoint
Method
Description
/report
POST
Submit health data
/reports
GET
Get region-wise data
/alerts
GET
Get outbreak alerts
/bulk-upload
POST
Sync offline data
📴 Offline Support
Stores data in localStorage
Syncs later using bulk upload
Ensures usability in low-connectivity regions
🔁 Fallback System
If no data is available:
Loads mock dataset
Ensures dashboard always works during demo
🚨 Alert System
Triggered when:
risk_score > threshold
Example:
⚠️ OUTBREAK ALERT: Rampur
Risk: 87%
🏆 Why This Project Stands Out
Combines health + environment + geography
Uses multi-source real-world data
Implements 15-model benchmarking
Supports offline rural use cases
Designed as a scalable public health system
🧠 Key Insight
“Early detection prevents large-scale outbreaks.”
🚀 Future Improvements
Real-time IoT water sensors
Government API integration
Mobile app for field workers
Time-series forecasting models
🧑‍💻 Team
Built for hackathon innovation 🚀
Focus: Real-world impact + scalability
📌 Final Pitch
JalRakshak is a real-time, AI-powered health intelligence system that combines field data, environmental signals, and machine learning to detect and prevent disease outbreaks in vulnerable regions.
