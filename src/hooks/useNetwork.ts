"use client";

import { useState, useCallback } from "react";
import {
  MOCK_CONNECTIONS,
  MOCK_SUGGESTIONS,
  MOCK_REQUESTS,
  MOCK_ENDORSEMENTS,
  type NetworkConnection,
  type NetworkSuggestion,
  type NetworkRequest,
  type SkillEndorsement,
} from "@/lib/constants/mock-data";

export function useNetwork() {
  const [connections, setConnections] =
    useState<NetworkConnection[]>(MOCK_CONNECTIONS);
  const [suggestions, setSuggestions] =
    useState<NetworkSuggestion[]>(MOCK_SUGGESTIONS);
  const [requests, setRequests] = useState<NetworkRequest[]>(MOCK_REQUESTS);
  const [endorsements, setEndorsements] =
    useState<SkillEndorsement[]>(MOCK_ENDORSEMENTS);

  /* -- Connection actions ------------------------------------------ */

  const removeConnection = useCallback((connectionId: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== connectionId));
  }, []);

  /* -- Request actions --------------------------------------------- */

  const sendRequest = useCallback((suggestionId: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
  }, []);

  const acceptRequest = useCallback(
    (requestId: string) => {
      const req = requests.find((r) => r.id === requestId);
      if (req) {
        // Add as new connection
        const newConnection: NetworkConnection = {
          id: `conn_${Date.now()}`,
          name: req.name,
          role: "worker",
          sector: "General",
          country: "Desconocido",
          city: "Desconocido",
          avatarLetter: req.avatarLetter,
          avatarGradient: req.avatarGradient,
          connectedSince: new Date().toISOString().split("T")[0],
          mutualConnections: 0,
          skills: [],
        };
        setConnections((prev) => [newConnection, ...prev]);
      }
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    },
    [requests]
  );

  const rejectRequest = useCallback((requestId: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  }, []);

  /* -- Endorsement actions ----------------------------------------- */

  const endorseSkill = useCallback((skillName: string) => {
    setEndorsements((prev) =>
      prev.map((e) =>
        e.skillName === skillName ? { ...e, count: e.count + 1 } : e
      )
    );
  }, []);

  /* -- Derived values ---------------------------------------------- */

  const incomingRequests = requests.filter((r) => r.direction === "incoming");
  const outgoingRequests = requests.filter((r) => r.direction === "outgoing");
  const totalEndorsements = endorsements.reduce((sum, e) => sum + e.count, 0);

  return {
    connections,
    suggestions,
    requests,
    endorsements,
    incomingRequests,
    outgoingRequests,
    totalEndorsements,
    removeConnection,
    sendRequest,
    acceptRequest,
    rejectRequest,
    endorseSkill,
  };
}
