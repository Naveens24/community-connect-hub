# Assistix

**Community-powered help for everyday tasks**

Assistix is a platform that connects people who need help with everyday tasks to neighbors and community members willing to lend a hand. Whether it's moving furniture, fixing a leaky faucet, or getting groceries delivered — Assistix makes it easy to find and offer help locally.

Unlike gig economy apps focused on professional services, Assistix is built for informal, community-driven assistance. It empowers individuals to post requests, pitch their skills, and build trust within their neighborhoods.

---

## Problem Statement

### The Gap We're Addressing

Getting help with small, everyday tasks shouldn't be complicated. Yet:

- **Professional services are overkill** — Hiring a plumber for a 5-minute fix or a moving company for one piece of furniture is expensive and inconvenient.
- **Social media is noisy** — Posting on Facebook groups or neighborhood apps gets lost in feeds and lacks structure.
- **Existing platforms focus on professionals** — TaskRabbit, Thumbtack, and similar apps are designed for vetted professionals, not casual community help.

### How Assistix Is Different

Assistix creates a **structured, location-based marketplace** for informal help. It's not about hiring professionals — it's about connecting with neighbors who can spare 30 minutes to help. Simple, human, local.

---

## Key Features

- **Post Help Requests** — Describe what you need, set your budget, and let your community respond
- **Pitch Your Skills** — Browse open requests and offer your help with a personalized pitch
- **Location-Based Feed** — See requests from your active city only, keeping help local
- **Real-Time Updates** — Requests and pitches sync instantly across all users
- **User Profiles** — Track your help history and build community reputation
- **Category Filtering** — Find requests by type: errands, repairs, moving, tech help, and more

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React + TypeScript | Component-based UI with type safety |
| Styling | Tailwind CSS | Utility-first responsive design |
| UI Components | shadcn/ui | Accessible, customizable component library |
| Backend | Firebase | Authentication, database, and file storage |
| Database | Cloud Firestore | Real-time NoSQL document database |
| Auth | Firebase Auth | Google and email/password authentication |
| Storage | Firebase Storage | Profile image uploads |
| Routing | React Router | Client-side navigation |

---

## Architecture Overview

Assistix follows a **serverless architecture** powered by Firebase:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React App     │────▶│  Firebase Auth  │     │ Firebase Storage│
│   (Frontend)    │     │  (User Login)   │     │ (Profile Images)│
└────────┬────────┘     └─────────────────┘     └─────────────────┘
         │
         │ Real-time subscriptions
         ▼
┌─────────────────┐
│ Cloud Firestore │
│   (Database)    │
│                 │
│ ├── users       │
│ ├── requests    │
│ └── pitches     │
└─────────────────┘
```

**How it works:**
1. Users authenticate via Firebase Auth (Google or email/password)
2. Authenticated users can post requests or submit pitches
3. Firestore provides real-time sync — updates appear instantly for all users
4. Requests are filtered by the user's active city for local relevance

---

## Data Model

### Firestore Collections

**`users`** — User profiles and preferences
```typescript
{
  uid: string
  name: string
  email: string
  photoURL?: string
  skills?: string[]
  helpsGiven: number
  activeCity: string
  createdAt: Timestamp
}
```

**`requests`** — Help requests posted by users
```typescript
{
  id: string
  title: string
  description: string
  category: string
  payment: number
  city: string
  status: 'open' | 'in_review' | 'assigned' | 'completed'
  creatorId: string
  creatorName: string
  creatorPhotoURL?: string
  createdAt: Timestamp
}
```

**`pitches`** — Offers submitted for requests
```typescript
{
  id: string
  requestId: string
  pitchText: string
  skills?: string[]
  helperId: string
  helperName: string
  helperPhotoURL?: string
  createdAt: Timestamp
}
```

---

## Current Status & Limitations

### What's Implemented (MVP)

- ✅ User authentication (Google + Email/Password)
- ✅ Profile creation with city selection
- ✅ Posting and viewing help requests
- ✅ Submitting pitches for requests
- ✅ Real-time feed updates
- ✅ Category and search filtering
- ✅ Request status management
- ✅ Profile image uploads

### Intentional MVP Limitations

| Feature | Status | Reasoning |
|---------|--------|-----------|
| In-app payments | Not included | Requires payment gateway integration; users handle payments offline |
| Real-time chat | Not included | Would add complexity; users can exchange contact info after matching |
| Ratings/reviews | Not included | Planned for future; requires completed transaction history |
| Push notifications | Not included | Would require additional infrastructure |

These are **deliberate MVP decisions** to ship a focused, functional product quickly.

---

## Setup & Local Development

### Prerequisites

- Node.js 18+ and npm
- A Firebase project with Firestore, Auth, and Storage enabled

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd assistix

# Install dependencies
npm install

# Start development server
npm run dev
```

### Firebase Configuration

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Google and Email/Password providers)
3. Create a **Firestore Database** in production mode
4. Enable **Storage** for profile images
5. Copy your Firebase config to `src/lib/firebase.ts`

> **Note:** You must create the Firestore database before running the app, or requests will fail to load.

---

## Future Enhancements

- **In-app messaging** — Secure communication between requesters and helpers
- **Rating system** — Build trust through verified reviews
- **Payment integration** — Optional escrow for larger tasks
- **Push notifications** — Alerts for new pitches and request updates
- **Verification badges** — Identity verification for trusted helpers
- **Task scheduling** — Calendar integration for planned help
- **Mobile app** — React Native version for iOS/Android

---

## Project Structure

```
src/
├── components/        # Reusable UI components
│   └── ui/           # shadcn/ui components
├── contexts/         # React context providers (Auth)
├── hooks/            # Custom React hooks
├── lib/              # Utilities and Firebase config
├── pages/            # Route components
└── services/         # Firestore operations
```

---

**Built with ❤️ for communities everywhere**
