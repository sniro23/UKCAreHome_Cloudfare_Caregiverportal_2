# CareConnect: The Caregiver Portal

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/sniro23/UKCAreHome_Cloudfare_Caregiverportal)

CareConnect is a visually stunning, mobile-first web application designed as the dedicated portal for caregivers within the UK Care Home Management Solution. It empowers caregivers with a suite of intuitive tools to manage their professional lives efficiently. The application focuses on a minimalist, clean, and highly usable interface, ensuring that caregivers can access critical information and perform tasks quickly, even during busy shifts.

## Table of Contents

- [About The Project](#about-the-project)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Development](#development)
- [Deployment](#deployment)

## About The Project

This portal is a client-side application that interacts with the existing Nest.js backend for the UK Care Home Management Solution. It provides caregivers with a centralized platform to manage their schedules, personal information, and patient care duties. The user experience is designed to be intuitive and efficient, with a strong emphasis on visual excellence and mobile-first responsiveness.

## Key Features

-   **Dashboard**: An at-a-glance view of current shifts, pending tasks, and quick access to duty logging.
-   **My Roster**: A comprehensive calendar for viewing weekly and monthly schedules and managing shift requests.
-   **My Profile**: A multi-tabbed section for managing personal information, work preferences, and critical documents (e.g., passports, compliance certificates) with data export capabilities.
-   **Assigned Patients**: A streamlined view of assigned patients for the current shift, providing essential, read-only details.
-   **Notifications**: A history of all system notifications, including SOS alerts, roster updates, and administrative messages.
-   **Duty Logging**: Geolocation-based clock-in/out to accurately log duty times.

## Technology Stack

This project is built with a modern, high-performance technology stack:

-   **Frontend**:
    -   [React](https://reactjs.org/)
    -   [Vite](https://vitejs.dev/)
    -   [TypeScript](https://www.typescriptlang.org/)
    -   [Tailwind CSS](https://tailwindcss.com/)
    -   [shadcn/ui](https://ui.shadcn.com/)
-   **Backend & Infrastructure**:
    -   [Cloudflare Workers](https://workers.cloudflare.com/)
    -   [Hono](https://hono.dev/)
-   **State Management**:
    -   [Zustand](https://zustand-demo.pmnd.rs/)
-   **Forms & Validation**:
    -   [React Hook Form](https://react-hook-form.com/)
    -   [Zod](https://zod.dev/)
-   **UI & Interaction**:
    -   [Framer Motion](https://www.framer.com/motion/)
    -   [Lucide React](https://lucide.dev/)
    -   [Sonner](https://sonner.emilkowal.ski/) (for notifications)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   [Bun](https://bun.sh/) installed on your machine.
-   A [Cloudflare account](https://dash.cloudflare.com/sign-up).

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/careconnect_caregiver_portal.git
    cd careconnect_caregiver_portal
    ```

2.  **Install dependencies:**
    This project uses `bun` for package management.
    ```sh
    bun install
    ```

3.  **Run the development server:**
    This command starts the Vite development server for the frontend and the `workerd` server for the backend functions.
    ```sh
    bun run dev
    ```
    The application will be available at `http://localhost:3000`.

## Development

The application is structured into three main parts:

-   `src/`: Contains the React frontend application, including pages, components, stores, and hooks.
-   `worker/`: Contains the Hono backend application that runs on Cloudflare Workers. All API logic resides here.
-   `shared/`: Contains TypeScript types and mock data shared between the frontend and backend.

When developing, any changes to files in `src/` or `worker/` will trigger a hot reload of the development server.

## Deployment

This application is designed for seamless deployment to the Cloudflare global network.

1.  **Build the application:**
    This command bundles the frontend and backend for production.
    ```sh
    bun run build
    ```

2.  **Deploy to Cloudflare:**
    Make sure you are logged into your Cloudflare account via the Wrangler CLI (`npx wrangler login`). Then, run the deploy script:
    ```sh
    bun run deploy
    ```
    This will publish your application and make it available on a `.workers.dev` subdomain.

Alternatively, you can deploy directly from your GitHub repository with a single click.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/sniro23/UKCAreHome_Cloudfare_Caregiverportal)