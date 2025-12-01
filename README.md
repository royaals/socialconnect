# SocialConnect

SocialConnect is a modern social media platform that allows users to share posts, connect with others, and engage through real-time interactions.

## Features

- **Post Management**: Create, edit, and delete posts with text and image content (up to 2MB).
- **Social Interactions**: Like posts, comment on content, and engage in conversations with other users.
- **Follow System**: Follow and unfollow users to build your personalized feed.
- **Real-Time Notifications**: Get instant notifications for follows, likes, and comments using WebSocket connections.
- **User Profiles**: Customizable profiles with avatar, cover image, bio, and user statistics.
- **Authentication**: Secure sign-up/sign-in with email or username, including password reset functionality.
- **Admin Dashboard**: Manage users, moderate content, and view platform statistics.
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing.

## Technologies Used

- Next.js 16 (App Router)
- TypeScript
- Supabase (PostgreSQL + Realtime)
- Tailwind CSS
- shadcn/ui
- Zustand (State Management)
- React Hook Form
- Zod (Validation)

## Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/royaals/socialconnect
   cd socialconnect
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   Create a `.env.local` file in the root directory and add the following variables:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Deployment

To deploy the application, follow the deployment instructions for your preferred hosting platform. Ensure you set the environment variables in your deployment environment.

## Contributing

Contributions are welcome! Please follow the [contribution guidelines](CONTRIBUTING.md) to contribute to this project.

## License

This project is licensed under the [MIT License](LICENSE).  