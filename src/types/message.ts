export interface Message {
  id: number;
  name: string;
  message: string;
  created_at: string;
}

export interface NewMessage {
  name: string;
  message: string;
}
