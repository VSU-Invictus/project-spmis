import { assertEquals, assertThrows } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { FunctionError } from './errors.ts';
import { parseFacultyInviteInput, parseFacultyOnboardingInput } from './faculty-onboarding.ts';

const input = { full_name: ' Synthetic Faculty ', department_id: '10000000-ABCD-4000-8000-000000000001' };

Deno.test('onboarding normalizes name and department UUID without accepting identity fields', () => {
  assertEquals(parseFacultyOnboardingInput(input), {
    full_name: 'Synthetic Faculty', department_id: input.department_id.toLowerCase(),
  });
});

Deno.test('onboarding rejects caller-supplied identity and privilege fields', () => {
  for (const key of ['id', 'email', 'role', 'status', 'actor_id', 'submitted_by']) {
    const error = assertThrows(() => parseFacultyOnboardingInput({ ...input, [key]: 'synthetic' }), FunctionError);
    assertEquals(error.status, 422);
  }
});

Deno.test('onboarding rejects invalid shapes, missing fields and unknown properties', () => {
  for (const value of [null, [], 'synthetic', {}, { full_name: 'Synthetic' }, { ...input, typo: true }]) {
    assertEquals(assertThrows(() => parseFacultyOnboardingInput(value), FunctionError).status, 422);
  }
});

Deno.test('onboarding enforces name and UUID boundaries', () => {
  for (const full_name of ['', '  ', 'x'.repeat(201), null, 123]) {
    assertThrows(() => parseFacultyOnboardingInput({ ...input, full_name }), FunctionError);
  }
  assertEquals(parseFacultyOnboardingInput({ ...input, full_name: 'x'.repeat(200) }).full_name.length, 200);
  for (const department_id of ['', 'invalid', null]) {
    assertThrows(() => parseFacultyOnboardingInput({ ...input, department_id }), FunctionError);
  }
});

Deno.test('invitations normalize email and reject invalid addresses', () => {
  assertEquals(parseFacultyInviteInput({ ...input, email: ' Synthetic@Example.Test ' }).email, 'synthetic@example.test');
  for (const email of ['', 'invalid', 'a b@example.test', 'a@@example.test', `${'x'.repeat(320)}@example.test`, null]) {
    assertThrows(() => parseFacultyInviteInput({ ...input, email }), FunctionError);
  }
});

Deno.test('invitations reject privilege overrides and redirect injection', () => {
  for (const key of ['role', 'status', 'id', 'redirect_to', 'password']) {
    assertEquals(assertThrows(() => parseFacultyInviteInput({
      ...input, email: 'synthetic@example.test', [key]: 'synthetic',
    }), FunctionError).status, 422);
  }
});

Deno.test('raw request length limits match the contract before trimming', () => {
  assertThrows(() => parseFacultyOnboardingInput({
    ...input, full_name: ` ${'x'.repeat(200)} `,
  }), FunctionError);
  const email = `${'x'.repeat(307)}@example.test`;
  assertEquals(email.length, 320);
  assertEquals(parseFacultyInviteInput({ ...input, email }).email, email);
  assertThrows(() => parseFacultyInviteInput({ ...input, email: ` ${email} ` }), FunctionError);
});
