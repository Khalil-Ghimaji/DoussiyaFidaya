import {sendGraphQLMutation} from "@/lib/graphql-client";
import {REGENERATE_ASSISTANT_CREDENTIALS} from "@/lib/graphql/doctor-mutations";

export function regenerateAssistantCredentials(assistantId: string) {
  return sendGraphQLMutation<>(REGENERATE_ASSISTANT_CREDENTIALS)

}