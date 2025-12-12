import { useEffect, useRef } from 'react';
import DailyIframe, { type DailyCall } from '@daily-co/daily-js';

interface VideoCallProps {
  roomUrl: string;
  onLeave: () => void;
}

export default function VideoCall({ roomUrl, onLeave }: VideoCallProps) {
  const callRef = useRef<HTMLDivElement>(null);
  const callFrame = useRef<DailyCall | null>(null);

  useEffect(() => {
    // Se não tiver URL ou se a DIV ainda não foi renderizada pelo React, aborta.
    if (!roomUrl || !callRef.current) return;

    // === A CORREÇÃO ESTÁ AQUI ===
    // Verifica se JÁ EXISTE uma instância do Daily rodando.
    // Antes você estava verificando "callRef.current" (a div), que sempre existe.
    if (callFrame.current) return;

    console.log("Iniciando Daily.co..."); // Log para confirmar que passou daqui

    // Cria o frame apenas uma vez
    const newCallFrame = DailyIframe.createFrame(callRef.current, {
      showLeaveButton: true,
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: '0',
        position: 'absolute', // Garante que ocupe o pai relativo
        top: '0',
        left: '0'
      }
    });

    callFrame.current = newCallFrame;

    newCallFrame.join({ url: roomUrl })
        .catch(err => console.error("Erro ao entrar na sala:", err));

    newCallFrame.on("left-meeting", () => {
      // Destrói a instância
      newCallFrame.destroy();
      callFrame.current = null;
      onLeave();
    });

    return () => {
      // Limpeza ao desmontar o componente
      try {
        if (callFrame.current) {
            callFrame.current.destroy();
            callFrame.current = null;
        }
      } catch (e) {
        console.error("Erro na limpeza:", e);
      }
    };
  }, [roomUrl, onLeave]);

  return <div ref={callRef} className="w-full h-full bg-black relative" />;
}