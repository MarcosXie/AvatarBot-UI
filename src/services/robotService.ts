// src/services/robotService.ts
import * as signalR from "@microsoft/signalr";
import api, { callApi } from "./api"; // Importa a instância do Axios configurada
import type { BotListItem } from "../types";

// Base URL do SignalR (precisa ser a raiz do backend, sem /api)
const HUB_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || "https://localhost:7010";

export const robotService = {
  // Envia comando via HTTP POST usando nossa infraestrutura do Axios
  sendCommand: async (thingCode: string, command: string, speed: number) => {
    return await callApi(async () => {
      return await api.post(`/api/command/${thingCode}`, {
        command,
        speed
      });
    });
  },

  // Cria a conexão SignalR (Mantemos isso aqui pois é específico do Robô)
  createSignalRConnection: (thingCode: string): signalR.HubConnection => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${HUB_BASE_URL}/robotHub?thingCode=${thingCode}`)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();
    return connection;
  },

  getBotsByUserId: async (userId: string) => {
    // GET /api/Bot/my-bots/{userId}
    return await callApi<BotListItem[]>(async () => 
      await api.get(`/api/Bot/my-bots/${userId}`)
    );
  }
};