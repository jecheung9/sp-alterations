import type { Client } from "./client";

interface BaseEntry {
  id: number;
  due: string;
  client: Client;
  status: "Not Started" | "Started" | "Complete" | "Dropped Off";
}

export interface AlterationEntry extends BaseEntry{
  type: "alteration";
  description: string;
  price: number;
}

export interface MeetingPickup extends BaseEntry {
  type: "meeting";
  meetingType: "pickup";
  description?: string;
}

export interface MeetingDropoff extends BaseEntry {
  type: "meeting";
  meetingType: "dropoff";
  alterationIds: number[];
}

export type MeetingEntry = MeetingPickup | MeetingDropoff;
export type Entry = AlterationEntry | MeetingEntry;

export type NewAlterationEntry = Omit<AlterationEntry, "id">;
export type NewMeetingEntry = Omit<MeetingEntry, "id">;
