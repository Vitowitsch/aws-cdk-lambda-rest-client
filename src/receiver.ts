import { Logger } from "@aws-lambda-powertools/logger";
import { get as api_get } from "./rest_client";

export const logger = new Logger({
  logLevel: "INFO",
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function rcv(event: any): Promise<void> {
  logger.info("call rest-api to retrieve...");
  try {
    const result = await api_get("resource");
    logger.debug("GET response:", result);
  } catch (error) {
    logger.error("Error from rest-api call:", error as string | Error);
    throw new Error("Failed to import tables");
  }
}
