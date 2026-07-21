# RAWAT SHOP V2.0 - Premium Wallpaper Platform

Yeh ek production-ready MERN Stack (MongoDB, Express, React, Node.js) application hai. Is guide mein aapko project local computer par chalane aur free mein internet par live karne (Deploy) ka poora tareeka milega.

---

## 1. Zaroori Accounts (Prerequisites)

Project ko live karne ke liye aapko in 5 websites par free account banana hoga:
1. **GitHub** (Code upload karne ke liye) - github.com
2. **MongoDB Atlas** (Database ke liye) - mongodb.com/atlas
3. **Cloudinary** (Images store karne ke liye) - cloudinary.com
4. **Render** (Backend live karne ke liye) - render.com
5. **Vercel** (Frontend live karne ke liye) - vercel.com

---

## 2. API Keys aur Database Setup

### A. MongoDB Atlas (Database)
1. Account banayein aur ek naya "Free Cluster" banayein.
2. "Database Access" mein jakar ek user banayein (Username aur Password yaad rakhein).
3. "Network Access" mein jakar IP Address ko `0.0.0.0/0` (Allow from anywhere) set karein.
4. "Database" > "Connect" > "Connect your application" par click karein.
5. Apna Connection String copy karein. Yeh kuch aisa dikhega: 
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/rawatshop?retryWrites=true&w=majority`
   *(<username> aur <password> ko apne banaye hue details se replace karein).*

### B. Cloudinary (Image Storage)
1. Dashboard par jayein.
2. Apna **Cloud Name**, **API Key**, aur **API Secret** copy kar lein.

---

## 3. Local Computer Par Chalana (Local Setup)

Apne computer mein VS Code (ya command prompt) kholiye.

### Backend Setup:
1. Terminal mein `backend` folder ke andar jayein:
   ```bash
   cd backend
