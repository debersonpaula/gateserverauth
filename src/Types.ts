export interface TError {
  status: number;
  error: string;
  message: string;
}

export interface TResponse {
  status: number;
  data: Object;
}