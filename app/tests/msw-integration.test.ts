import { describe, expect, it } from 'vitest';
import { apiClient, request, ApiRequestError } from '../src/lib/api';

const studentId = '45b54332-e470-4c21-a839-7428c4f6bf42';

describe('API client integration with MSW', () => {
  it('returns a 200 search response through apiClient and request()', async () => {
    const students = await request(
      apiClient.GET('/rest/v1/rpc/search_students', {
        params: { query: { query: 'Maria' } },
      }),
    );

    const result = students ?? [];
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: studentId, first_name: 'Maria' });
  });

  it('returns a 201 review response through apiClient and request()', async () => {
    const review = await request(
      apiClient.POST('/functions/v1/reviews', {
        body: {
          student_id: studentId,
          body_document: {
            blocks: [{ type: 'paragraph', content: [{ text: 'A contract-compliant review.' }] }],
          },
        },
      }),
    );

    expect(review).toMatchObject({
      student_id: studentId,
      body_text: 'A contract-compliant review.',
      status: 'active',
    });
  });

  it('converts a 422 review validation response into ApiRequestError', async () => {
    const error = await request(
      apiClient.POST('/functions/v1/reviews', {
        body: { student_id: studentId, body_document: { blocks: [] } },
      }),
    ).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error).toMatchObject({ status: 422, code: 'REVIEW_BODY_REQUIRED' });
  });

  it('converts a 429 chatbot response into ApiRequestError', async () => {
    const sendMessage = () => apiClient.POST('/functions/v1/chat', { body: { message: 'hello' } });
    for (let index = 0; index < 3; index += 1) {
      expect(await request(sendMessage())).toMatchObject({ message: expect.any(String) });
    }

    const error = await request(sendMessage()).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error).toMatchObject({ status: 429, code: 'RATE_LIMITED' });
  });
});
