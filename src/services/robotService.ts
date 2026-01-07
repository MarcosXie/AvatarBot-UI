// src/services/robotService.ts
import * as signalR from "@microsoft/signalr";
import api from "./api"; 
import type { BotListItem, BotResponse } from "../types";

// Base URL do SignalR
const HUB_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || "https://localhost:7010";

export const robotService = {
  // POST /api/command/{thingCode}
  sendCommand: async (thingCode: string, command: string, speed: number): Promise<void> => {
    await api.post(`/api/command/${thingCode}`, {
      command,
      speed
    });
  },

  // Cria a conexão SignalR
  createSignalRConnection: (thingCode: string): signalR.HubConnection => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${HUB_BASE_URL}/robotHub?thingCode=${thingCode}`)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();
    return connection;
  },

  // GET /api/Bot/my-bots/{userId}
getBotsByUserId: async (userId: string, isDemo: boolean = false): Promise<BotListItem[]> => {
  const response = await api.get<BotListItem[]>(`/api/Bot/my-bots/${userId}`, {
    params: { isDemo }
  });
  return response.data;
},
  // GET /api/Bot/{id}
  getById: async (id: string): Promise<BotResponse> => {
    const response = await api.get<BotResponse>(`/api/Bot/${id}`);
    return response.data;
  },

  // POST /api/Bot/redeem/{redeemCode}/{userId}
  redeemBot: async (redeemCode: string, userId: string): Promise<void> => {
    await api.post(`/api/Bot/redeem/${redeemCode}/${userId}`);
  }
};