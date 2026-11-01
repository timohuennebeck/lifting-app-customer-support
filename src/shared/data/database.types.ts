// The part of the Supabase schema the desk uses, in the shape `supabase gen types` writes (type
// aliases, which supabase-js needs). The schema lives in lifting-app/supabase/migrations; keep
// this in step with it, or replace it with the generated file.

export type TicketKind = 'bug' | 'idea';
export type TicketStatus = 'open' | 'planned' | 'resolved' | 'closed';
export type MessageAuthor = 'user' | 'team';
export type EventKind = 'status' | 'reopened';
export type Platform = 'ios' | 'android';

export type InboxRow = {
  id: string;
  number: number;
  user_id: string;
  kind: TicketKind;
  status: TicketStatus;
  /** Importance 1–5 of an idea; null for bugs. */
  priority: number | null;
  subject: string;
  platform: Platform | null;
  os_version: string | null;
  device_model: string | null;
  app_version: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  last_author: MessageAuthor | null;
  last_preview: string | null;
  last_activity_at: string;
  /** The user's last message or reopen. */
  user_activity_at: string | null;
  read_at: string | null;
  unread: boolean | null;
};

export type MessageRow = {
  id: string;
  user_id: string;
  ticket_id: string;
  author: MessageAuthor;
  content: string;
  /** Storage paths in the ticket-attachments bucket. */
  attachments: string[];
  created_at: string;
};

export type EventRow = {
  id: string;
  user_id: string;
  ticket_id: string;
  kind: EventKind;
  status: TicketStatus | null;
  version: string | null;
  note: string | null;
  created_at: string;
};

export type CustomerRow = {
  user_id: string;
  first_name: string | null;
  /** App language: en, de, pt-PT, pt-BR or ko. */
  language: string | null;
  email: string | null;
  /** apple, google, email or anonymous. */
  provider: string | null;
  signed_up_at: string;
  last_active_at: string | null;
};

export type Database = {
  public: {
    Tables: {
      ticket_messages: {
        Row: MessageRow;
        Insert: {
          user_id: string;
          ticket_id: string;
          author: MessageAuthor;
          content: string;
          id?: string;
          attachments?: string[];
          created_at?: string;
        };
        Update: Partial<MessageRow>;
        Relationships: [];
      };
      ticket_events: {
        Row: EventRow;
        Insert: {
          user_id: string;
          ticket_id: string;
          kind: EventKind;
          status?: TicketStatus | null;
          version?: string | null;
          note?: string | null;
          id?: string;
          created_at?: string;
        };
        Update: Partial<EventRow>;
        Relationships: [];
      };
      support_ticket_reads: {
        Row: { ticket_id: string; read_at: string };
        Insert: { ticket_id: string; read_at: string };
        Update: { ticket_id?: string; read_at?: string };
        Relationships: [];
      };
    };
    Views: {
      support_inbox: {
        Row: InboxRow;
        Relationships: [];
      };
    };
    Functions: {
      support_customers: {
        Args: never;
        Returns: CustomerRow[];
      };
    };
    Enums: {
      platform: Platform;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
