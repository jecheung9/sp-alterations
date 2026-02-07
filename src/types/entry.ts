export interface Entry {
  id: number;
  type: 'alteration' | 'meeting';
  due: string;
  client: string;
  price?: number;
  description: string;
  status: "Not Started" | "Started" | "Complete" | "Dropped Off";
}
