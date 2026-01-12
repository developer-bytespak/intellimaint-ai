interface IAxiosResponse {
  message: string;
  data?: {
    role?: string;
    id?: string;
    _id?: string;
    email?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    [key: string]: any;
  };
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