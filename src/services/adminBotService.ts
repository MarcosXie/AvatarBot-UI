import type { BotUpdateDto } from "../types";
import api from "./api";

// Tipos baseados nos seus DTOs C#
export interface BotCreateDto {
  name: string;
  code: string;
  wifiPassword: string;
  modelId?: string | null;
}

export interface BotResponseDto {
  id: string;
  name: string;
  code: string;
  roomUrl: string;
  wifiPassword: string;
  modelId?: string;
  active: boolean;
  awsThingName: string;
  redeemCode?: string;
  redeemDate?: string;
}

export const adminBotService = {
  // GET /api/Bot (Retorna todos)
  getAll: async () => {
    return (await api.get('/api/Bot')).data
  },

  // POST /api/Bot (Cria e retorna string do RedeemCode)
  create: async (data: BotCreateDto) => {
    return (await api.post('/api/Bot', data)).data
  },

  update: async (id: string, data: BotUpdateDto) => {
    await api.put(`/api/Bot/${id}`, data);
  },

  delete: async (id: string) => {
    await api.delete(`/api/Bot/${id}`);
  },

  // === NOVO: Download Sketch ===
  downloadSketch: async (botId: string, botCode: string) => {
    try {
      // Fazemos a chamada direta ao axios para configurar o responseType como 'blob'
      const response = await api.get(`/api/Bot/${botId}/download`, {
        responseType: 'blob' // Importante para arquivos zip/binários
      });

      // Cria um link temporário no navegador para iniciar o download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      // Define o nome do arquivo
      link.setAttribute('download', `bot_${botCode}_sketch.zip`);
      
      document.body.appendChild(link);
      link.click();
      
      // Limpeza
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error("Erro ao baixar sketch", error);
      throw error;
    }
  }
};