import type { Entry } from "../types/entry";

export const meetingsData: Entry[] = [
  {
    id: 1,
    type: 'meeting',
    due: "2026-01-28T14:30",
    client: "Hall Madden",
    status: "Not Started",
    description: "(1) Alex D"
  },
  {
    id: 2,
    type: 'meeting',
    due: "2026-01-30T10:30",
    client: "Benny - B&B Menswear",
    status: "Not Started",
    description: ""
  },
  {
    id: 3,
    type: 'meeting',
    due: "2026-01-28T12:00",
    client: "Catherine - 11th State",
    status: "Complete",
    description: "some very long description to test asdfasdfasfadsfasdfdsa"
  },
  {
    id: 4,
    type: 'meeting',
    due: "2026-01-29T13:30",
    client: "A.P.C",
    status: "Complete",
    description: "",
  }
];