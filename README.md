# Sedapify
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/AzimHsy/sedapify.git)

Sedapify is a comprehensive, AI-powered social food platform built with Next.js and Supabase. It seamlessly integrates recipe generation, grocery e-commerce, real-time delivery tracking, and community features into a single, cohesive application.

## Core Features

-   **AI-Powered Tools**:
    -   **Recipe Generation**: Instantly create recipes from a list of ingredients using Groq's high-speed LLMs.
    -   **Smart Inputs**: AI-assisted text correction and voice-to-text input for creating recipes in multiple languages (English, Malay, Chinese).
-   **Multi-Role Architecture**:
    -   **Admin Panel**: Full oversight of users, orders, content (recipes/videos), and platform analytics.
    -   **Merchant Dashboard**: Manage shop inventory, process incoming orders, and switch between multiple owned shops.
    -   **Driver App**: Accept delivery jobs, view active routes, communicate with customers via live chat, and track earnings.
    -   **Customer Experience**: A rich interface for discovering recipes, shopping, tracking orders, and interacting with the community.
-   **E-commerce & Logistics**:
    -   **Grocery Shopping**: Browse products from various merchant stores.
    -   **Stripe Integration**: Secure checkout process for grocery orders.
    -   **Real-time Delivery**: Live map tracking of driver location from store to destination, powered by Supabase Realtime.
    -   **Order Management**: A complete order lifecycle from pending payment to completion, with real-time status updates for all parties.
-   **Social & Community**:
    -   **Content Creation**: Users can manually create and edit recipes or upload short cooking videos (Reels).
    -   **Interactions**: Like, save, and comment on recipes and videos.
    -   **User Profiles & Following**: Follow your favorite chefs and view their content.
    -   **Ranking System**: Leaderboards for top-rated chefs and recipes.
    -   **Notifications**: Real-time updates on follows, likes, saves, and comments.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Database & Backend**: [Supabase](https://supabase.com/) (Auth, Postgres, Storage, Realtime)
-   **AI**: [Groq](https://groq.com/) (for Llama 3.3 model access)
-   **Payments**: [Stripe](https://stripe.com/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI**: [Lucide React](https://lucide.dev/) for icons, [Recharts](https://recharts.org/) for charts
-   **Deployment**: Vercel

## Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

-   Node.js (v20 or later)
-   npm, pnpm, or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/azimhsy/sedapify.git
    cd sedapify
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of your project and add the following keys. You will need to create accounts with Supabase, Groq, and Stripe to get these values.

    ```env
    # Supabase Credentials
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

    # AI Provider (Groq)
    GROQ_API_KEY=YOUR_GROQ_CLOUD_API_KEY

    # Stripe Payments
    STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY
    STRIPE_WEBHOOK_SECRET=YOUR_STRIPE_WEBHOOK_SECRET

    # Application Base URL
    NEXT_PUBLIC_BASE_URL=http://localhost:3000
    ```

4.  **Set up Supabase Database:**
    You will need to set up the appropriate tables, storage buckets, and row-level security (RLS) policies in your Supabase project. The server actions in `app/actions/` provide a good reference for the required schema. Key tables include `users`, `recipes`, `products`, `orders`, `likes`, `follows`, `cooking_videos`, and `drivers`.

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.