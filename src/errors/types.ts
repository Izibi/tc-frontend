
export type AppError = {
  source: "react" | "saga" | "reducer",
  error: Error | null,
  info?: {componentStack: any}
}

export type ErrorsState = {
  lastError: null | AppError
}
