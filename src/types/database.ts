export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          email: string
          first_name: string | null
          last_name: string | null
          bio: string | null
          avatar_url: string | null
          cover_url: string | null
          website: string | null
          location: string | null
          role: 'user' | 'admin'
          is_verified: boolean
          is_active: boolean
          privacy: 'public' | 'private' | 'followers_only'
          created_at: string
          updated_at: string
          last_login: string | null
        }
        Insert: {
          id: string
          username: string
          email: string
          first_name?: string | null
          last_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          cover_url?: string | null
          website?: string | null
          location?: string | null
          role?: 'user' | 'admin'
          is_verified?: boolean
          is_active?: boolean
          privacy?: 'public' | 'private' | 'followers_only'
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          username?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          cover_url?: string | null
          website?: string | null
          location?: string | null
          role?: 'user' | 'admin'
          is_verified?: boolean
          is_active?: boolean
          privacy?: 'public' | 'private' | 'followers_only'
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
      }
      posts: {
        Row: {
          id: string
          author_id: string
          content: string
          image_url: string | null
          category: 'general' | 'announcement' | 'question'
          is_active: boolean
          like_count: number
          comment_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          content: string
          image_url?: string | null
          category?: 'general' | 'announcement' | 'question'
          is_active?: boolean
          like_count?: number
          comment_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          content?: string
          image_url?: string | null
          category?: 'general' | 'announcement' | 'question'
          is_active?: boolean
          like_count?: number
          comment_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          actor_id: string | null
          type: 'follow' | 'like' | 'comment' | 'mention'
          post_id: string | null
          comment_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          actor_id?: string | null
          type: 'follow' | 'like' | 'comment' | 'mention'
          post_id?: string | null
          comment_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          actor_id?: string | null
          type?: 'follow' | 'like' | 'comment' | 'mention'
          post_id?: string | null
          comment_id?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
    }
  }
}