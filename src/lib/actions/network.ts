"use server";

import {
  MOCK_CONNECTIONS,
  MOCK_SUGGESTIONS,
  MOCK_REQUESTS,
  MOCK_ENDORSEMENTS,
  MOCK_NETWORK_ACTIVITY,
  type NetworkConnection,
  type NetworkSuggestion,
  type NetworkRequest,
  type SkillEndorsement,
  type NetworkActivity,
} from "@/lib/constants/mock-data";

/* ------------------------------------------------------------------ */
/*  Connections                                                        */
/* ------------------------------------------------------------------ */

export async function getConnections(): Promise<NetworkConnection[]> {
  return MOCK_CONNECTIONS;
}

export async function removeConnection(
  connectionId: string
): Promise<{ success: boolean }> {
  // Mock: pretend we removed it
  void connectionId;
  return { success: true };
}

/* ------------------------------------------------------------------ */
/*  Suggestions                                                        */
/* ------------------------------------------------------------------ */

export async function getSuggestions(): Promise<NetworkSuggestion[]> {
  return MOCK_SUGGESTIONS;
}

/* ------------------------------------------------------------------ */
/*  Requests                                                           */
/* ------------------------------------------------------------------ */

export async function getRequests(): Promise<NetworkRequest[]> {
  return MOCK_REQUESTS;
}

export async function sendConnectionRequest(
  targetUserId: string,
  message?: string
): Promise<{ success: boolean }> {
  void targetUserId;
  void message;
  return { success: true };
}

export async function respondToRequest(
  requestId: string,
  action: "accept" | "reject"
): Promise<{ success: boolean }> {
  void requestId;
  void action;
  return { success: true };
}

/* ------------------------------------------------------------------ */
/*  Endorsements                                                       */
/* ------------------------------------------------------------------ */

export async function getEndorsements(): Promise<SkillEndorsement[]> {
  return MOCK_ENDORSEMENTS;
}

export async function endorseSkill(
  userId: string,
  skillName: string
): Promise<{ success: boolean; newCount: number }> {
  void userId;
  const existing = MOCK_ENDORSEMENTS.find((e) => e.skillName === skillName);
  return { success: true, newCount: (existing?.count ?? 0) + 1 };
}

/* ------------------------------------------------------------------ */
/*  Activity Feed                                                      */
/* ------------------------------------------------------------------ */

export async function getNetworkActivity(): Promise<NetworkActivity[]> {
  return MOCK_NETWORK_ACTIVITY;
}
