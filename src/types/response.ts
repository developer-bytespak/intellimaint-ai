interface IAxiosResponse {
  message: string;
}

interface IAxiosError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      data?: string[];
    };
  };
  message?: string;
  config?: {
    url?: string;
  };
}

export type { IAxiosResponse, IAxiosError };