This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

Bet A Buddy Sports is a Next.js web application designed to facilitate golf matches between players and teams. The platform focuses on creating a streamlined, game-like experience similar to multiplayer lobbies in gaming, where users can create matches, find opponents, track scores, and earn rewards.

### Key Features

- **Match Creation & Joining**: Create golf matches with invite links or join existing matches
- **Real-time Scoring**: Live score tracking during matches with hole-by-hole entry
- **Points & Rewards System**: Earn "Buddy Points" for participating in matches and redeem at local businesses
- **Friend System**: Connect with other golfers and build your network
- **Location-based Matching**: Find matches at specific golf courses using Google Maps integration
- **User Profiles**: Track match history, points, and statistics

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project with Firestore enabled
- Google Maps API key
- SendGrid account (for email notifications)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bet-a-buddy-webapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory with the following variables:

   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_MEASUREMENT_ID=your_measurement_id

   # Firebase Admin (for server-side operations)
   FIREBASE_ADMIN_PROJECT_ID=your_project_id
   FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

   # Email Service (SendGrid)
   SENDGRID_API_KEY=your_sendgrid_api_key
   SENDER_EMAIL=your_sender_email@domain.com

   # Google Maps
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

   # Constant Contact (Optional - for marketing emails)
   CONSTANT_CONTACT_CLIENT_ID=your_client_id
   CONSTANT_CONTACT_CLIENT_SECRET=your_client_secret
   CONSTANT_CONTACT_ACCESS_TOKEN=your_access_token
   CONSTANT_CONTACT_REFRESH_TOKEN=your_refresh_token
   CONSTANT_CONTACT_MAIN_LIST_ID=your_list_id
   ```

4. **Set up Firebase**

   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication with Email/Password
   - Enable Firestore Database
   - Deploy the security rules from `firestore.rules`
   - Set up Firebase Admin SDK service account

5. **Deploy Firestore Security Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

6. **Deploy Cloud Functions** (Optional - for points system)
   ```bash
   cd functions
   npm install
   cd ..
   firebase deploy --only functions
   ```

7. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Cloud Functions)
- **Maps**: Google Maps API with Places Autocomplete
- **Email**: SendGrid
- **Deployment**: Vercel (recommended) or Firebase Hosting

### Project Structure

```
bet-a-buddy-webapp/
├── app/                          # Next.js App Router
│   ├── (dashboard)/             # Protected dashboard routes
│   ├── api/                     # API routes
│   ├── lobbies/                 # Lobby management (future feature)
│   ├── matches/                 # Match-related pages
│   │   ├── [id]/               # Individual match pages
│   │   ├── browse/             # Browse available matches
│   │   ├── create/             # Create new match
│   │   └── join/               # Join match via invite
│   ├── matchmaking/            # Matchmaking system (future)
│   ├── users/                  # User profiles
│   └── settings/               # User settings
├── components/                  # Reusable React components
├── contexts/                   # React contexts (Auth, etc.)
├── firebase/                   # Firebase configuration & services
│   ├── services/              # Firestore service functions
│   ├── admin.ts               # Firebase Admin setup
│   ├── client.ts              # Firebase client setup
│   └── config.ts              # Firestore configuration
├── functions/                  # Firebase Cloud Functions
├── types/                      # TypeScript type definitions
├── public/                     # Static assets
└── scripts/                    # Utility scripts
```

### Database Schema

The application uses Firebase Firestore with the following main collections:

#### Users Collection (`/users/{userId}`)
```typescript
{
  uid: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  points: number;           // Total Buddy Points earned
  createdAt: number;
  updatedAt: number;
  profilePicture?: string;
  bio?: string;
}
```

#### Matches Collection (`/matches/{matchId}`)
```typescript
{
  id: string;
  title: string;
  hostId: string;           // User who created the match
  participants: string[];   // Array of user IDs
  participantEmails: Record<string, string>;
  numberOfHoles: 9 | 18;
  location?: string;        // Golf course name
  address?: {               // Golf course location
    address: string;
    lat: number;
    lng: number;
    placeId: string;
    locationName?: string;
  };
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  scores?: Record<number, Record<string, number>>; // hole -> userId -> score
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  type: 'invite';           // Currently only invite-based matches
}
```

#### Friends Collection (`/friends/{friendshipId}`)
```typescript
{
  user1Id: string;
  user2Id: string;
  createdAt: number;
}
```

#### Friend Requests Collection (`/friendRequests/{requestId}`)
```typescript
{
  senderId: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
  updatedAt?: number;
}
```

#### Points History Collection (`/pointsHistory/{historyId}`)
```typescript
{
  userId: string;
  matchId: string;
  points: number;
  reason: 'match_completion' | 'linking' | 'finding_opponents';
  createdAt: number;
}
```

## 🎮 User Flows

### 1. User Registration & Authentication
1. User visits the landing page
2. Clicks "Get Started" or navigates to `/register`
3. Creates account with email/password
4. Email verification (optional)
5. Completes profile setup
6. Redirected to dashboard

### 2. Creating a Match
1. User navigates to "Create Match" from dashboard
2. Enters match title and selects golf course location
3. Chooses number of holes (9 or 18)
4. Match is created with status 'pending'
5. Invite link is generated for sharing
6. Host can share link with other players

### 3. Joining a Match
1. User receives invite link
2. Clicks link and is taken to join page
3. If logged in, can join immediately
4. If not logged in, prompted to register/login
5. Upon joining, added to match participants
6. Can view match details and wait for start

### 4. Playing a Match
1. Host starts the match (status changes to 'active')
2. All participants can access scoring interface
3. Players enter scores hole-by-hole
4. Real-time updates show leaderboard
5. Match completes when all holes are scored
6. Points are automatically awarded via Cloud Function

### 5. Points & Rewards System
1. Users earn 10 points for completing matches
2. Additional points for linking with new partners
3. Points accumulate in user profile
4. Can be redeemed at partner businesses
5. Points history tracked for transparency

## 🔧 Configuration & Setup Details

### Current Production Environment

**CRITICAL**: The app is currently deployed and using these production resources:

- **Firebase Project**: `bet-a-buddy-sports-site`
- **Domain**: betabuddysports.com (configured in Firebase hosting)
- **SendGrid Account**: support@betabuddysports.com
- **Constant Contact Account**: ryno@betabuddysports.com
- **Google Cloud Project**: `bet-a-buddy-sports-site` (same as Firebase)

### Firebase Setup

**EXISTING PRODUCTION PROJECT**: `bet-a-buddy-sports-site`

1. **Access Current Firebase Project**
   - Project ID: `bet-a-buddy-sports-site`
   - Console: [Firebase Console](https://console.firebase.google.com/project/bet-a-buddy-sports-site)
   - **REQUIRES**: Owner/Editor access to be transferred

2. **Current Authentication Setup**
   - Email/Password provider enabled
   - Authorized domains: betabuddysports.com, localhost
   - **Production users exist** - handle with care

3. **Current Firestore Database**
   - Production database with live user data
   - Security rules deployed from `firestore.rules`
   - **Contains live matches, users, points data**

4. **Firebase Admin Service Account**
   - Service account: `firebase-adminsdk-fbsvc@bet-a-buddy-sports-site.iam.gserviceaccount.com`
   - Private key in environment variables
   - **REQUIRES**: Service account key rotation for security

### Google Maps Setup

**EXISTING PRODUCTION SETUP**: Uses Google Cloud project `bet-a-buddy-sports-site`

1. **Current Google Cloud Project**
   - Project ID: `bet-a-buddy-sports-site` (same as Firebase)
   - Console: [Google Cloud Console](https://console.cloud.google.com/apis/dashboard?project=bet-a-buddy-sports-site)
   - **REQUIRES**: Project access transfer

2. **Enabled APIs** (Currently Active)
   - Maps JavaScript API ✅
   - Places API ✅
   - Geocoding API ✅

3. **Production API Key**
   - Current Key: `AIzaSyAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (Contact current owner)
   - **SECURITY**: Restricted to betabuddysports.com domain
   - **BILLING**: Active billing account required
   - **ACTION NEEDED**: Transfer billing account ownership

### SendGrid Setup

**EXISTING PRODUCTION ACCOUNT**: support@betabuddysports.com

1. **Current SendGrid Account**
   - Verified sender: support@betabuddysports.com
   - **REQUIRES**: Account access transfer
   - **ACTIVE**: Currently sending emails for the app

2. **Production API Key**
   - Current Key: Contact current owner for access credentials
   - Permissions: Mail Send (Full Access)
   - **SECURITY**: Rotate key after handoff

### Constant Contact Setup

**EXISTING MARKETING INTEGRATION**: ryno@betabuddysports.com

1. **Current Constant Contact Account**
   - Account: ryno@betabuddysports.com
   - **REQUIRES**: Account access transfer
   - **ACTIVE**: Used for newsletter signups

2. **Production API Credentials**
   - Client ID: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (Contact current owner)
   - Client Secret: `xxxxxxxxxxxxxxxxxxxxxx` (Contact current owner)
   - Main List ID: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (Contact current owner)
   - **TOKENS**: Access/Refresh tokens expire and need renewal

## 🚀 Deployment

### Current Production Deployment

**LIVE APPLICATION**: Currently deployed and serving users

- **Platform**: Vercel (recommended) or Firebase Hosting
- **Domain**: betabuddysports.com
- **Status**: Production-ready with live users
- **Environment**: All production environment variables configured

### Vercel Deployment (Current Setup)

1. **Existing Vercel Project**
   - **REQUIRES**: Vercel account access transfer
   - **DOMAIN**: betabuddysports.com configured
   - **ENVIRONMENT**: All production variables set

2. **Environment Variables** (Production)
   - All variables from `.env.local` configured in Vercel
   - **CRITICAL**: Firebase Admin private key properly escaped
   - **SECURITY**: Rotate all API keys after handoff

3. **Custom Domain Configuration**
   - Domain: betabuddysports.com
   - **DNS**: Configured and pointing to Vercel
   - **SSL**: Automatic HTTPS enabled

### Firebase Hosting Alternative

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Build and Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

## 🧪 Testing

### Running Tests

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# bet-a-buddy
# bet-a-buddy
