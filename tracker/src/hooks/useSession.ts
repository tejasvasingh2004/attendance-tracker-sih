import { useState, useCallback } from 'react';
import { sessionApi } from '../core/api/endpoints';
import {
  CreateSessionRequest,
  CreateSessionResponse,
  GetSessionsRequest,
  GetSessionsResponse,
  GetSessionByIdResponse,
  UpdateSessionRequest,
  UpdateSessionResponse,
  DeleteSessionResponse,
  StartSessionResponse,
  EndSessionResponse,
  CheckAutoStartResponse,
  Session,
} from '../core/api/types';

interface UseSessionReturn {
  // State
  sessions: Session[];
  currentSession: Session | null;
  loading: boolean;
  error: string | null;

  // Actions
  createSession: (data: CreateSessionRequest) => Promise<CreateSessionResponse>;
  getSessions: (params?: GetSessionsRequest) => Promise<void>;
  getSessionById: (id: string) => Promise<Session>;
  updateSession: (id: string, data: UpdateSessionRequest) => Promise<UpdateSessionResponse>;
  deleteSession: (id: string) => Promise<DeleteSessionResponse>;
  startSession: (id: string) => Promise<StartSessionResponse>;
  endSession: (id: string) => Promise<EndSessionResponse>;
  checkAutoStart: () => Promise<CheckAutoStartResponse>;
  clearError: () => void;
}

export const useSession = (): UseSessionReturn => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createSession = useCallback(async (data: CreateSessionRequest): Promise<CreateSessionResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionApi.createSession(data);
      if (response.session) {
        setSessions(prev => [response.session!, ...prev]);
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSessions = useCallback(async (params?: GetSessionsRequest): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionApi.getSessions(params);
      setSessions(response.sessions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sessions';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSessionById = useCallback(async (id: string): Promise<Session> => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionApi.getSessionById(id);
      setCurrentSession(response.session);
      return response.session;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch session';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSession = useCallback(async (id: string, data: UpdateSessionRequest): Promise<UpdateSessionResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionApi.updateSession(id, data);
      setSessions(prev => prev.map(session =>
        session.id === id ? response.session : session
      ));
      if (currentSession?.id === id) {
        setCurrentSession(response.session);
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update session';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  const deleteSession = useCallback(async (id: string): Promise<DeleteSessionResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionApi.deleteSession(id);
      setSessions(prev => prev.filter(session => session.id !== id));
      if (currentSession?.id === id) {
        setCurrentSession(null);
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete session';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  const startSession = useCallback(async (id: string): Promise<StartSessionResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionApi.startSession(id);
      setSessions(prev => prev.map(session =>
        session.id === id ? response.session : session
      ));
      if (currentSession?.id === id) {
        setCurrentSession(response.session);
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start session';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  const endSession = useCallback(async (id: string): Promise<EndSessionResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionApi.endSession(id);
      setSessions(prev => prev.map(session =>
        session.id === id ? response.session : session
      ));
      if (currentSession?.id === id) {
        setCurrentSession(response.session);
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end session';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentSession]);

  const checkAutoStart = useCallback(async (): Promise<CheckAutoStartResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionApi.checkAutoStart();
      // Optionally update sessions list if auto-started sessions are returned
      if (response.autoStartedSessions?.length) {
        setSessions(prev => {
          const updatedSessions = [...prev];
          response.autoStartedSessions.forEach(autoStarted => {
            const index = updatedSessions.findIndex(s => s.id === autoStarted.id);
            if (index !== -1) {
              updatedSessions[index] = autoStarted;
            } else {
              updatedSessions.push(autoStarted);
            }
          });
          return updatedSessions;
        });
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check auto-start sessions';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    sessions,
    currentSession,
    loading,
    error,
    createSession,
    getSessions,
    getSessionById,
    updateSession,
    deleteSession,
    startSession,
    endSession,
    checkAutoStart,
    clearError,
  };
};
