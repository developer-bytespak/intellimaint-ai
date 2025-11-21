interface IAxiosResponse {
  message: string;
}

interface IAxiosError {
  response: {
    data: {
      message: string;
    };
  };
}

export type { IAxiosResponse, IAxiosError };