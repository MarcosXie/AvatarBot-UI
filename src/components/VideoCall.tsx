import { useEffect, useRef } from 'react';
import DailyIframe, { type DailyCall } from '@daily-co/daily-js';

interface VideoCallProps {
  roomUrl: string;
  onLeave: () => void;
}

export default function VideoCall({ roomUrl, onLeave }: VideoCallProps) {
  const callRef = useRef<HTMLDivElement>(null);
  const callFrame = useRef<DailyCall | null>(null);

  // Usamos uma ref para o onLeave para evitar que o useEffect seja recriado
  // se a função onLeave mudar de identidade (comum em React)
  const onLeaveRef = useRef(onLeave);
  useEffect(() => {
    onLeaveRef.current = onLeave;
  }, [onLeave]);

  // EFEITO 1: Ciclo de Vida do Iframe (Criação e Destruição)
  // Esse efeito roda APENAS na montagem inicial (array de dependências vazio [])
  useEffect(() => {
    if (!callRef.current) return;

    // 1. Verificação de Segurança Global
    // O Daily.co é um singleton em muitos aspectos. Verificamos se já existe uma instância ativa.
    const existingInstance = DailyIframe.getCallInstance();
    if (existingInstance) {
      console.warn("Instância existente detectada. Destruindo antes de criar nova...");
      existingInstance.destroy();
    }

    console.log("🛠️ Criando nova instância do DailyIframe...");

    const newCallFrame = DailyIframe.createFrame(callRef.current, {
      showLeaveButton: true,
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: '0',
        position: 'absolute',
        top: '0',
        left: '0'
      }
    });

    callFrame.current = newCallFrame;

    // Configura o listener de saída
    newCallFrame.on("left-meeting", () => {
      // Quando o usuário clica em sair no iframe, chamamos a prop do pai
      if (onLeaveRef.current) {
        onLeaveRef.current();
      }
    });

    // Cleanup: Destrói o frame quando o componente VideoCall for desmontado
    return () => {
      console.log("🗑️ Limpando instância do DailyIframe...");
      try {
        newCallFrame.destroy();
        callFrame.current = null;
      } catch (e) {
        console.error("Erro ao destruir frame:", e);
      }
    };
  }, []); // <--- Array vazio: Criação acontece apenas UMA vez

  // EFEITO 2: Gestão da Sala (Entrar/Sair)
  // Esse efeito roda quando a URL muda ou quando o frame foi criado
  useEffect(() => {
    if (!callFrame.current || !roomUrl) return;

    const frame = callFrame.current;

    // Função para gerenciar a entrada
    const joinRoom = async () => {
      try {
        // Se já estivermos em uma reunião (mudança de sala), saímos primeiro
        const meetingState = frame.meetingState();
        if (meetingState === 'joined-meeting' || meetingState === 'joining-meeting') {
             await frame.leave();
        }

        console.log("🚀 Entrando na sala:", roomUrl);
        await frame.join({ url: roomUrl });
      } catch (err) {
        console.error("Erro ao gerenciar entrada na sala:", err);
      }
    };

    joinRoom();

  }, [roomUrl]); // Roda sempre que a URL mudar

  return <div ref={callRef} className="w-full h-full bg-black relative" />;
}