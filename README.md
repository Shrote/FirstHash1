
# FirstHash Admin Dashboard

An admin dashboard built with **Next.js**, **Firebase**, and **Tailwind CSS**, featuring:
- Auth-based routing
- Sidebar navigation with permission control
- Modular components

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/firsthash.git
cd firsthash
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Firebase

* Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
* Enable **Email/Password** authentication
* Create a **Firestore** database
* Add a test user to Firestore in a `users` collection, using the UID as the document ID. Example document:

```json
{
  "email": "admin@example.com",
  "userType": "Admin"
}
```

* Create a `.env.local` file in the root:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
...
```

> Make sure your Firebase config is correctly set up in `lib/firebase.js`

---

## 🔐 Authentication

The `LoginForm` component (`components/login-form.jsx`) handles:

* Sign-in with email/password
* Storing user type and access levels in `localStorage`
* Redirecting to `/dashboard` on successful login

On login:

* Admin users are granted access to "dashboard" and "logs"
* LocalStorage stores:

  * `userName`
  * `userType`
  * `userAccessLevels` (as JSON)

---

## 🧭 Sidebar Navigation

The sidebar (`components/app-sidebar.jsx`) renders links based on user permissions.

### Components Breakdown:

* `app-sidebar.jsx` – Controls the layout and renders nav components
* `nav-main.jsx` – Renders main sidebar items
* Other nav components (`nav-order.jsx`, etc.) follow the same pattern

Each nav item is defined with:

```js
{
  title: "Dashboard",
  icon: LayoutDashboardIcon,
  href: "/dashboard",
  permission: "dashboard"
}
```

Sidebar only renders items that match permissions stored in `localStorage`.

---

## 🗂 Directory Structure

```
app/
  dashboard/
  login/
  logs/
  footer/
components/
  app-sidebar.jsx
  login-form.jsx
  nav-main.jsx
  nav-*.jsx (optional)
public/
  images/
lib/
  firebase.js
```

---

## ✅ Features

* 🔐 Firebase Auth (Email/Password)
* 📁 Modular, permission-based navigation
* 🎨 Tailwind CSS styling
* 🌐 Client-side routing with Next.js

---

## 🛠 To Do

* Add dynamic user roles & permissions via Firestore
* Add more sidebar modules (Inventory, Orders, QR, etc.)
* Mobile responsiveness

---

## 📸 Screenshots

Add your app screenshots here.

---

## 📄 License

MIT License — Free for personal and commercial use.

```

