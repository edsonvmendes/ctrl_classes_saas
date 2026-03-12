type LogLevel = "error" | "info" | "warn";

type LogPayload = {
  data?: Record<string, unknown>;
  event: string;
  level?: LogLevel;
  requestId: string;
  scope: string;
};

export function createRequestId() {
  return crypto.randomUUID();
}

export function toErrorMetadata(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
    };
  }

  return {
    message: String(error),
    name: "UnknownError",
  };
}

export function logServerEvent({
  data,
  event,
  level = "info",
  requestId,
  scope,
}: LogPayload) {
  const payload = {
    ...(data ? { data } : {}),
    event,
    level,
    requestId,
    scope,
    timestamp: new Date().toISOString(),
  };

  const line = JSON.stringify(payload);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.info(line);
}

export function logServerError({
  data,
  error,
  event,
  requestId,
  scope,
}: {
  data?: Record<string, unknown>;
  error: unknown;
  event: string;
  requestId: string;
  scope: string;
}) {
  logServerEvent({
    data: {
      ...(data ?? {}),
      error: toErrorMetadata(error),
    },
    event,
    level: "error",
    requestId,
    scope,
  });
}
