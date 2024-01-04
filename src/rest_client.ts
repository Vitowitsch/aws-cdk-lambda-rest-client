import axios, { AxiosResponse, AxiosError } from "axios";
import { Logger } from "@aws-lambda-powertools/logger";

export const logger = new Logger({
  logLevel: "INFO",
});

const BASE_URL = "https://example.com/api";

export async function get(endpoint: string): Promise<any> {
  try {
    const response: AxiosResponse = await axios.get(`${BASE_URL}/${endpoint}`);
    return response.data;
  } catch (error: unknown) {
    handleRequestError(error as AxiosError<unknown, any>);
  }
}

export async function post(endpoint: string, data: any): Promise<any> {
  try {
    const response: AxiosResponse = await axios.post(
      `${BASE_URL}/${endpoint}`,
      data,
    );
    return response.data;
  } catch (error: unknown) {
    handleRequestError(error as AxiosError<unknown, any>);
  }
}

/* istanbul ignore next */
function handleRequestError(err: AxiosError) {
  const error = err as AxiosError<unknown, any>;
  if (error.response) {
    logger.error("Request error:", {
      Error: JSON.stringify(error.response.data),
      Status: error.response.status,
    });
  } else if (error.request) {
    logger.error("No response received:", error.request);
  } else {
    logger.error("Error:", error.message);
  }
  throw error;
}
