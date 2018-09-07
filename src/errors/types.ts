
export type AppError = {
  source: "react" | "saga" | "reducer",
  error: Error | undefined,
  info?: {componentStack: any}
}

export type ErrorsState = {
  lastError: AppError | undefined
}
