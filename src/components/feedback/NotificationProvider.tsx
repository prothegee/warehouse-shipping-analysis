import React, {
  createContext,
  useState,
  useCallback,
  useContext
} from "react";
import { Snackbar, Alert } from '@mui/material';

type Severity = "info" | "success" | "warning" | "error";

interface Notification {
  id: number;
  message: string;
  severity: Severity;
}
interface NotificationContextValue {
  notify: (message: string, severity?: Severity) => void;
}

let idCounter = 0;

const NotificationContext = createContext<NotificationContextValue>({ notify: () => {} });

export function useNotification() {
  return useContext(NotificationContext);
}

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<Notification[]>([]);
  const current = queue[0] ?? null;
  const notify = useCallback((message: string, severity: Severity = "info") => {
    setQueue(prev => [...prev, { id: idCounter++, message, severity }]);
  }, []);

  const handleClose = useCallback(() => {
    setQueue(prev => prev.slice(1));
  }, []);

  return(
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {current && (
        <Snackbar
          key={current.id}
          open
          autoHideDuration={4000}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity={current.severity} onClose={handleClose} sx={{ minWidth: 280 }}>
            {current.message}
          </Alert>
        </Snackbar>
      )}
    </NotificationContext.Provider>
  );
}
