# 🏡 [Smart Renting](https://www.smartrenting.studio/)

This project aims to develop an intelligent rental platform that empowers tenants to make better housing decisions. By integrating a customizable scoring system and a recommendation engine based on natural language processing, the platform allows users to evaluate and compare rental properties based on key priorities such as proximity to essential services and neighborhood safety. The goal is to move beyond static listings and offer a personalized, data-driven rental search experience.

## ⚙️ Tech Stacks Used in this Project

<ul>
<li>Framework: React 18 + Next.js</li>
<li>Programming Language: TypeScript</li>
<li>Styling/UI: Tailwind CSS + MUI + Shadcn UI</li>
<li>Icons: Lucide React</li>
<li>State Management: Zustand</li>
<li>Maps/Geolocation: Google Maps API</li>
<li>HTTP Client: Axios</li>
<li>Database: Supabase</li>
<li>Authentication: Clerk</li>
<li>Deployment: Vercel</li>
</ul>

## 📂 Project Structure

Some important project files or folders are shown as follows:

- Data Schema: `src/database/schema.sql`
- API Routes: `src/app/api`
- Project Components: `src/components`
- Global State: `src/stores`

## ⌛️ How to Run the Project Locally

1. Clone the repo:

```bash
git clone https://github.com/joyjoy998/Smart-Renting.git
cd smart-renting
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file

The following are the environment variables required for the project:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY =
NEXT_PUBLIC_SUPABASE_URL =
SUPABASE_SERVICE_ROLE_KEY =
NEXT_PUBLIC_SUPABASE_ANON_KEY =
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
CLERK_SECRET_KEY =
NEXT_PUBLIC_GOOGLE_LIGHT_MAPS_ID =
NEXT_PUBLIC_GOOGLE_DARK_MAPS_ID =
```

The keys with the prefix `NEXT_PUBLIC_` need to be exposed to the frontend, and the keys without the prefix are high-privilege keys, which are only used in the backend.

4. Run development server

```bash
npm run dev
```

## 🏆 Contribution

This project was developed in collaboration with [ClaireWu27](https://github.com/ClaireWu27), [mushroom18](https://github.com/mushroom18), [YaraWang999](https://github.com/YaraWang999) and [quilla3](https://github.com/quilla3).
Thanks to everyone for their dedication and hard work throughout this project. It has been a pleasure collaborating with such a committed team, and we’re proud to have completed this journey together.
