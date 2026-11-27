import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient, request, ApiRequestError } from '../lib/api';
import type { components } from '../../../contract/generated/schema';

export type ChatRequest = components['schemas']['ChatRequest'];
export type ChatResponse = components['schemas']['ChatResponse'];
export type ChatTurn = components['schemas']['ChatTurn'];

export type AskChatbotVariables =
  | ChatRequest
  | { body: ChatRequest; headers?: Record<string, string> };

export function useAskChatbot(
  options?: UseMutationOptions<ChatResponse, ApiRequestError, AskChatbotVariables>
) {
  return useMutation<ChatResponse, ApiRequestError, AskChatbotVariables>({
    mutationFn: async (variables: AskChatbotVariables): Promise<ChatResponse> => {
      const isWrapped = 'body' in variables && typeof variables.body === 'object' && 'message' in variables.body;
      const body = isWrapped ? (variables as { body: ChatRequest }).body : (variables as ChatRequest);
      const headers = isWrapped ? (variables as { headers?: Record<string, string> }).headers : undefined;

      const result = await request(
        apiClient.POST('/functions/v1/chat', {
          body,
          headers,
        })
      );
      return result as ChatResponse;
    },
    ...options,
  });
}
