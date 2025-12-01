'use client';

import { useState } from 'react';
import { CreatePost } from '@/components/posts/CreatePost';
import { PostList } from '@/components/posts/PostList';

export default function HomePage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <CreatePost onPostCreated={handlePostCreated} />
      <PostList refresh={refreshKey} />
    </div>
  );
}