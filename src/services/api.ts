// src/services/api.ts
import * as signalR from "@microsoft/signalr";

const API_BASE_URL = "http://localhost:5005";

export const api = {
  // Envia comando via POST
  sendCommand: async (thingCode: string, command: string, speed: number): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/command/${thingCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            command, 
            speed 
        }),
      });
      return await response.json();
    } catch (error) {
      console.error("Erro ao enviar comando:", error);
      throw error;
    }
  },

  // Cria a conexão SignalR
  createSignalRConnection: (thingCode: string): signalR.HubConnection => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/robotHub?thingCode=${thingCode}`)
      .withAutomaticReconnect()
      .build();
    return connection;
  }
};  