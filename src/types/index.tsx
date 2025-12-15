// src/types/index.ts

export interface RobotStatus {
  awsIot: boolean;
  esp8266Connected: boolean;
  lastHeartbeat?: string;
}

export interface TelemetryData {
  device_id: string;
  wifi_rssi: number;
  uptime: number;
  free_heap?: number;
}

export interface SignalRMessage {
  type: 'connection' | 'heartbeat' | 'status' | 'speed_update';
  thingCode?: string;
  timestamp?: string;
  status?: RobotStatus;
  data?: any;
}

export interface CommandPayload {
  command: string;
  speed: number;
  thingCode?: string;
}

export interface ChatMessage {
  id: number | string;
  sender: string;
  senderName: string;
  text: string;
  timestamp: Date;
  isLocal: boolean;
}

export interface BotListItem {
  id: string; // GUID do banco
  name: string;
  code: string; // O "ThingCode" (ex: ExpoBot_Felipe)
  active: boolean;
  awsThingName: string;
}