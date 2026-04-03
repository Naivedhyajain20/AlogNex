# ⚡️ ALGONEX

### Master Your LeetCode Journey, Multiplied.

[![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-Data%20Viz-FF6384?style=for-the-badge&logo=chart.js)](https://www.chartjs.org/)

**ALGONEX** is a premium LeetCode revision tracker designed to solve the "forgetting problem" in technical interview preparation. By leveraging a custom **Spaced Repetition** algorithm and seamless LeetCode synchronization, ALGONEX ensures that once you solve a problem, you never forget the approach.

---

## ✨ Key Features

### 📅 Intelligent Spaced Repetition
- **Automated Scheduling**: Problems are automatically queued for revision based on your performance.
- **Customizable Intervals**: Set your own revision cadence (e.g., 1, 3, 7, 14, 30 days) to match your learning speed.
- **Daily Quotas**: Stay consistent without burning out by setting a daily problem limit.

### 🔗 LeetCode Sync Engine
- **One-Click Linking**: Connect your LeetCode profile using just your username.
- **Submission Tracking**: Automatically detects "Accepted" submissions via LeetCode's GraphQL API.
- **History Import**: Import your past coding history to populate your revision queue instantly.

### 📊 Advanced Analytics
- **Productivity Volume**: Visualize your progress over the last 14 days with an interactive bar chart.
- **Difficulty Distribution**: Keep your skills balanced with a breakdown of Easy, Medium, and Hard problems.
- **Sync Status**: Real-time indicators showing your connection state and pending revisions.

### 💎 Premium Experience
- **Stunning UI**: A modern, glassmorphic design system optimized for dark mode.
- **Optimized Performance**: Built with Next.js 14 for lightning-fast navigation and server-side logic.
- **Secure Auth**: Powered by Supabase for reliable, unified authentication (Email or ALGONEX ID).

---

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Library**: [React 18](https://react.dev/)
- **Styling**: Vanilla CSS (Custom Design System with Design Tokens)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Charts**: [Chart.js](https://www.chartjs.org/) with [react-chartjs-2](https://react-chartjs-2.js.org/)
- **Fonts**: Montserrat (Logo/Headers) & Inter (Body)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- NPM or PNPM
- A Supabase account (for auth and data persistence)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/algonex.git
   cd algonex
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Launch the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🏗 Project Structure

```text
/
├── app/                  # Next.js App Router (Layouts, Pages, APIs)
│   ├── api/              # Backend routes (LeetCode GraphQL proxy)
│   ├── globals.css       # Core Design System and Utility Classes
│   └── layout.jsx        # Root Layout & Font Configuration
├── components/           # Reusable UI Components
│   ├── Dashboard.jsx     # Main landing view
│   ├── Charts.jsx        # Visualization wrappers
│   ├── Settings.jsx      # User preferences and scheduling
│   └── ...
├── hooks/                # Custom React Hooks (Auth, Persistence)
├── lib/                  # Utility functions and Supabase client
└── public/               # Static assets
```

---

## 🛡 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue for any bugs or feature requests.

*Crafted with ❤️ by the ALGONEX Team.*
