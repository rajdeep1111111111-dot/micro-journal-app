export type User = {
  id: string;
  email: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type JournalEntry = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
};

export type AiReflection = {
  id: string;
  entry_id: string;
  reflection: string;
  created_at: string;
};

export type Friendship = {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  updated_at: string;
};

export type SharedEntry = {
  id: string;
  entry_id: string;
  shared_by: string;
  shared_with: string;
  created_at: string;
};

export type Reaction = {
  id: string;
  shared_entry_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
};

export type Comment = {
  id: string;
  shared_entry_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type Streak = {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_entry_date: string | null;
  updated_at: string;
};
