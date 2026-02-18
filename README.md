# 🌿 VaultLeaf Drive

**Secure. Decentralized. Simple.**

VaultLeaf Drive is a Drive-like cloud storage application built on the **Internet Computer**, using **Motoko** for the backend and **React + TypeScript** for the frontend. It provides secure file and folder management with authentication, access control, and a modern responsive UI powered by Tailwind CSS.

---

## 🚀 Features

### 🔐 Authentication & User Profiles
- Internet Identity login
- Principal-based access control
- First-time user profile setup
- Automatic actor re-initialization on identity change
- Secure session handling

### 📁 File & Folder Management
- Create, rename, move, and delete files & folders
- Breadcrumb navigation
- Grid and List view toggle
- Search functionality
- Sort controls (field + direction)
- Bulk selection & delete
- Context menus for quick actions

### 📦 Upload & Export
- Multi-file upload with progress tracking
- Folder export as ZIP-like blob
- Smart file open with MIME type detection
- Browser-viewable fallback or download

### ⚠️ Robust Error Handling
- Auth-aware error normalization
- Actor initialization warning banner
- Loading, empty, and error states
- Retry mechanisms for failed queries

### 🎨 Modern UI
- Tailwind CSS with OKLCH theme tokens
- Light / Dark theme toggle
- Responsive layout
- Clean Drive-like interface

---

## 🏗️ Tech Stack

### Frontend
- React
- TypeScript
- React Query
- Tailwind CSS
- Internet Identity

### Backend
- Motoko (Internet Computer canister)
- Access control system
- User profile management
- File & folder metadata storage
- Blob storage mixins
- Authorization validation

### Infrastructure
- Internet Computer (ICP)
- DFX (local development & deployment)

---

## 📂 Project Structure

VaultLeaf-Drive/
│
├── backend/
│   └── main.mo                 # Motoko canister (auth + storage logic)
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Auth, Drive, Layout, Feedback components
│   │   ├── hooks/              # Actor, Internet Identity, Queries
│   │   ├── utils/              # File open, folder export, error helpers
│   │   └── App.tsx             # Main app controller
│   │
│   ├── index.html
│   ├── index.css
│   ├── tailwind.config.js
│   └── README.md
│
├── feature_evidence.json
├── project_state.json
└── README.md

---

## 🧠 Core Architecture

### 🔹 Backend (Motoko Canister)
- Manages user profiles and authorization
- Stores folder hierarchy and file metadata
- Handles blob storage
- Enforces access validation on all operations

### 🔹 Frontend
- Uses React Query for server state management
- Custom hooks for actor initialization
- Modular file manager components
- URL parameter persistence
- Robust UI feedback states

---

## 🛠️ Local Development

### Prerequisites
- Node.js (18+ recommended)
- DFX SDK
- Internet Identity canister running locally

### 1️⃣ Clone Repository

git clone https://github.com/your-username/vaultleaf-drive.git  
cd vaultleaf-drive  

### 2️⃣ Start Local Internet Computer

dfx start --background  
dfx deploy  

### 3️⃣ Run Frontend

cd frontend  
npm install  
npm run dev  

Frontend will typically run on:  
http://localhost:5173  

---

## 🔒 Security Model

- All operations are principal-scoped
- Authorization validated server-side
- No client-trusted permissions
- Identity-driven actor binding
- Graceful handling of expired or invalid sessions

---

## 📌 Future Enhancements

- File sharing with permission levels
- Real ZIP archive generation
- File previews (PDF, images, video)
- Storage quota management
- Drag-and-drop uploads
- Public share links

---

## 🤝 Contributing

1. Fork the repository  
2. Create a feature branch  
3. Commit changes  
4. Open a pull request  

---

## 📄 License

MIT License

---

## 🌿 VaultLeaf Drive

A decentralized, secure alternative to traditional cloud storage — built for the Internet Computer ecosystem.
