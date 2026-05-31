import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';

export const useSignalR = () => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7196/hubs/notification', {
        accessTokenFactory: () => token,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    return () => {
      newConnection.stop();
    };
  }, []);

  return connection;
};
