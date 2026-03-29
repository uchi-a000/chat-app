// ===== User =====

export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  nickname: string | null;
  avatar: string | null;
  created_at: string;
  updated_at: string;
};

export type MessageUser = Pick<User, "id" | "first_name" | "last_name">;

export type RoomUser = Pick<
  User,
  "id" | "first_name" | "last_name" | "nickname" | "avatar"
>;

// ===== Message =====

export type MessageType = "text" | "image" | "file";

export type Message = {
  id: string;
  room_id: string;
  content: string;
  type: MessageType;
  user: RoomUser | null;
  created_at: string;
  updated_at: string;
};

export type LastMessage = {
  id: string;
  content: string;
  type: MessageType;
  user: MessageUser;
  created_at: string;
};

// ===== Room =====

export type Room = {
  id: string;
  name: string;
  is_group: boolean;
  last_message: LastMessage | null;
  users: RoomUser[] | null;
  created_at: string;
  updated_at: string;
};

// ===== Requests =====

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export type CreateRoomRequest = {
  name?: string;
  is_group: boolean;
  user_ids: string[];
};

export type SendMessageRequest = {
  content: string;
  type: MessageType;
};

// ===== Errors =====

export type ApiValidationError = {
  status: number;
  message: string;
  errors: Record<string, string[]>;
};
