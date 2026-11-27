import { assertEquals, assertThrows } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { normalizeApplicationIds } from './approval-request.ts';
import { FunctionError } from './errors.ts';

const first = '61200000-abcd-4000-8000-000000000001';
const second = '61200000-abcd-4000-8000-000000000002';

Deno.test('application UUIDs normalize to lowercase while preserving distinct IDs and order', () => {
  assertEquals(normalizeApplicationIds([second.toUpperCase(), first]), [second, first]);
});

Deno.test('application UUID duplicates are rejected regardless of casing', () => {
  for (const ids of [[first, first], [first, first.toUpperCase()], [first.toUpperCase(), first]]) {
    const error = assertThrows(() => normalizeApplicationIds(ids), FunctionError);
    assertEquals(error.status, 422);
    assertEquals(error.code, 'INVALID_APPLICATION_IDS');
  }
});

Deno.test('application UUID validation rejects malformed values and empty or oversized batches', () => {
  for (const value of [undefined, null, first, [], [null], [42], ['not-a-uuid'], Array(101).fill(first)]) {
    const error = assertThrows(() => normalizeApplicationIds(value), FunctionError);
    assertEquals(error.status, 422);
    assertEquals(error.code, 'INVALID_APPLICATION_IDS');
  }
});

Deno.test('application UUID validation accepts the 100-item boundary after normalization', () => {
  const ids = Array.from({ length: 100 }, (_, index) =>
    `61200000-abcd-4000-8000-${index.toString(16).padStart(12, '0')}`);
  assertEquals(normalizeApplicationIds(ids.map((id) => id.toUpperCase())), ids);
});
