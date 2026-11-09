import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'vitest';
import ts from 'typescript';

async function moduleUrl(path) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return `data:text/javascript;base64,${Buffer.from(output).toString('base64')}`;
}

const queryKeysUrl = await moduleUrl('../src/hooks/queryKeys.ts');
const { queryKeys } = await import(queryKeysUrl);

test('queryKeys derives correct operationId namespace for searchStudents', () => {
  const key = queryKeys.searchStudents({ query: 'Maria' });
  assert.equal(key[0], 'searchStudents');
  assert.deepEqual(key[1], { query: 'Maria' });
});

test('queryKeys derives getStudentById key with student UUID parameter', () => {
  const uuid = '45b54332-e470-4c21-a839-7428c4f6bf42';
  const key = queryKeys.studentById(uuid);
  assert.equal(key[0], 'getStudentById');
  assert.equal(key[1], uuid);
});

test('queryKeys derives listStudentReviews with filters', () => {
  const key = queryKeys.studentReviews({ status: 'eq.active' });
  assert.equal(key[0], 'listStudentReviews');
  assert.deepEqual(key[1], { status: 'eq.active' });
});

test('queryKeys derives listApprovalQueueItems with queue filter', () => {
  const key = queryKeys.approvalQueueItems({ status: 'eq.pending' });
  assert.equal(key[0], 'listApprovalQueueItems');
  assert.deepEqual(key[1], { status: 'eq.pending' });
});

test('queryKeys derives taxonomy and audit log keys', () => {
  assert.equal(queryKeys.departments()[0], 'listDepartments');
  assert.equal(queryKeys.programs()[0], 'listPrograms');
  assert.equal(queryKeys.auditLogs()[0], 'listAuditLogs');
});

