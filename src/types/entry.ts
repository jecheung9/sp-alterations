import type { Client } from "./client";

export interface Entry {
  id: number;
  type: 'alteration' | 'meeting';
  due: string;
  client: Client;
  price?: number;
  description: string;
  status: "Not Started" | "Started" | "Complete" | "Dropped Off";
}
