import "core-js/features/map";
import { DVCOptions } from "./types";
import { DVCClient } from "./client";

export { DVCClient };
export { defaultLogger } from "./utils/logger";
export * from "./types";

export function initialize(
  environmentKey: string,
  options?: DVCOptions
): DVCClient {
  if (!environmentKey) {
    throw new Error(
      "Missing environment key! Call initialize with a valid environment key"
    );
  }

  return new DVCClient(environmentKey, options);
}
