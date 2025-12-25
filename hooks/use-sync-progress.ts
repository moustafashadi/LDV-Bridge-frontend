import { useState, useEffect, useCallback, useRef } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export interface SyncProgressEvent {
  sandboxId: string;
  step: number;
  totalSteps: number;
  status: "pending" | "in-progress" | "completed" | "error";
  message: string;
  details?: string;
  timestamp: string;
}

export interface UseSyncProgressOptions {
  sandboxId: string;
  enabled?: boolean;
  onComplete?: (event: SyncProgressEvent) => void;
  onError?: (event: SyncProgressEvent) => void;
}

export interface UseSyncProgressResult {
  progress: number;
  currentStep: number;
  totalSteps: number;
  status: "idle" | "pending" | "in-progress" | "completed" | "error";
  message: string;
  details?: string;
  isConnected: boolean;
  reset: () => void;
}

/**
 * Hook to subscribe to sync progress updates via Server-Sent Events
 */
export function useSyncProgress({
  sandboxId,
  enabled = true,
  onComplete,
  onError,
}: UseSyncProgressOptions): UseSyncProgressResult {
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(8);
  const [status, setStatus] = useState<
    "idle" | "pending" | "in-progress" | "completed" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState<string | undefined>();
  const [isConnected, setIsConnected] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);

  // Keep callbacks up to date
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
  }, [onComplete, onError]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setStatus("idle");
    setMessage("");
    setDetails(undefined);
  }, []);

  useEffect(() => {
    if (!enabled || !sandboxId) {
      return;
    }

    // Get token from localStorage or session
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken") ||
          sessionStorage.getItem("accessToken")
        : null;

    // Create SSE connection with token in query params (since SSE doesn't support headers easily)
    const url = new URL(`${API_URL}/sandboxes/${sandboxId}/sync/progress`);
    if (token) {
      url.searchParams.set("token", token);
    }

    const eventSource = new EventSource(url.toString());
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setStatus("pending");
      console.log("[SSE] Connected to sync progress stream");
    };

    eventSource.onmessage = (event) => {
      try {
        const data: SyncProgressEvent = JSON.parse(event.data);

        setCurrentStep(data.step);
        setTotalSteps(data.totalSteps);
        setMessage(data.message);
        setDetails(data.details);

        if (data.status === "completed" && data.step === data.totalSteps) {
          setStatus("completed");
          onCompleteRef.current?.(data);
        } else if (data.status === "error") {
          setStatus("error");
          onErrorRef.current?.(data);
        } else {
          setStatus(data.status === "completed" ? "in-progress" : data.status);
        }
      } catch (e) {
        console.error("[SSE] Failed to parse event:", e);
      }
    };

    eventSource.onerror = () => {
      // SSE errors are expected when:
      // 1. The sync completes and the backend closes the stream
      // 2. Network interruption
      // We don't log this as an error since it's normal behavior
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    };
  }, [sandboxId, enabled]);

  const progress =
    totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;

  return {
    progress,
    currentStep,
    totalSteps,
    status,
    message,
    details,
    isConnected,
    reset,
  };
}
