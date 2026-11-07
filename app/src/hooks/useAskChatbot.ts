import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient, request, ApiRequestError } from '../lib/api';
import type { components } from '../../../contract/generated/schema';

export type ChatRequest = components['schemas']['ChatRequest'];
export type ChatResponse = components['schemas']['ChatResponse'];
export type ChatTurn = components['schemas']['ChatTurn'];

export function useAskChatbot(
  options?: UseMutationOptions<ChatResponse, ApiRequestError, ChatRequest>
) {
  return useMutation<ChatResponse, ApiRequestError, ChatRequest>({
    mutationFn: async (body: ChatRequest): Promise<ChatResponse> => {
      const result = await request(
        apiClient.POST('/functions/v1/chat', {
          body,
        })
      );
      return result as ChatResponse;
    },
    ...options,
  });
}
