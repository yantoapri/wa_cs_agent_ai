export interface Channel {
  id: string;
  name: string;
  type: "whatsapp" | "messenger" | "telegram";
  whatsapp_number?: string;
  icon_url?: string;
  takeover_ai: boolean;
  waktu_takeover: number;
  limit_balasan_ai: boolean;
  maksimum_balasan_ai: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  name: string;
  type: "ai" | "manusia";
  status: "online" | "offline" | "busy" | "away";
  no_hp?: string;
  avatar_url?: string;
  description?: string;
  kepintaran?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentAIConfig {
  id: string;
  agent_id: string;
  gaya_bicara?: string;
  pengetahuan?: string;
  handover_conditions?: any[];
  followup_configs?: any[];
  kirim_gambar_configs?: any[];
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone_number?: string;
  avatar_url?: string;
  channel_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  channel_id: string;
  contact_id?: string;
  contact_phone: string;
  contact_name?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  assigned_agent_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  message_type: "text" | "image" | "document" | "audio" | "video";
  direction: "inbound" | "outbound";
  content: string;
  media_url?: string;
  sender_id?: string;
  sender_name?: string;
  is_read: boolean;
  created_at: string;
}

export interface ChannelAgentConnection {
  id: string;
  channel_id: string;
  agent_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
