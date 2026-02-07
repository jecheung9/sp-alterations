import type { Entry } from "../types/entry";

export const todoData: Entry[] = [
  {
    id: 1,
    type: 'alteration',
    due: "2026-01-28",
    client: "Hall Madden",
    price: 16,
    completed: false,
    description: "Alex D gray suit -0.5 sleeve"
  },
  {
    id: 2,
    type: 'alteration',
    due: "2026-01-30",
    client: "Benny - B&B Menswear",
    price: 60,
    completed: false,
    description: "pants +0.5 length -1 waist"
  },
  {
    id: 3,
    type: 'alteration',
    due: "2026-01-28",
    client: "Catherine - 11th State",
    price: 75,
    completed: false,
    description: "some very long description to test truncation asdfasdfasfadsfasdfdsa"
  },
  {
    id: 4,
    type: 'alteration',
    due: "2026-01-28",
    client: "A.P.C",
    price: 17,
    completed: true,
    description: ""
  },
  {
    id: 5,
    type: 'alteration',
    due: "2026-03-28",
    client: "Personal",
    price: 60,
    completed: false,
    description: ""
  }
];