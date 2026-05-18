# SportConnect - Frontend

SportConnect is a modern web application designed to seamlessly connect sports enthusiasts with sports venues. This frontend repository is built with performance, modern aesthetics, and excellent developer experience in mind.

## 🚀 Technologies

*   **Framework:** React 19
*   **Language:** TypeScript
*   **Build Tool:** Vite
*   **Routing:** React Router v7
*   **Data Fetching & State Management:** TanStack Query (React Query) & Axios
*   **Authentication:** JWT (JSON Web Tokens) & Google OAuth
*   **Styling:** Vanilla CSS (Modern, vibrant, dynamic design system)
*   **Icons:** Lucide React

## 📂 Project Structure

```text
src/
├── api/          # Axios client configuration with interceptors
├── assets/       # Static assets (images, fonts, icons)
├── components/   # Reusable UI components (buttons, forms, layouts)
├── hooks/        # Custom React hooks (TanStack Query hooks, etc.)
├── pages/        # Page components corresponding to routes (Admin, Auth, Owner, etc.)
├── services/     # API service layers
├── App.tsx       # Main application routing
├── main.tsx      # Application entry point and providers
└── index.css     # Global styles and design tokens
```

## 🛠️ Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   npm or yarn

### Installation

1.  Clone the repository and navigate to the frontend directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables:
    Create a `.env` file in the root directory and add necessary variables (e.g., `VITE_GOOGLE_CLIENT_ID`).

4.  Start the development server:
    ```bash
    npm run dev
    ```

### Building for Production

To create a production build:
```bash
npm run build
```

## 🎨 Design Philosophy

The UI is built focusing on a **Premium & Dynamic Aesthetic**:
*   Rich, vibrant color palettes tailored for sports and activity.
*   Glassmorphism effects, smooth gradients, and deep shadows.
*   Subtle micro-animations to enhance user engagement.
*   Fully responsive layout optimized for mobile (PWA-ready) and desktop.
