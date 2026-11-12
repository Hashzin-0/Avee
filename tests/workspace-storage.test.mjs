import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialWorkspace, parseWorkspaceData } from '../src/features/workspace/storage.ts';

test('initial workspace provides a clearly labeled planning farm and lot', () => {
  const workspace = createInitialWorkspace();
  assert.equal(workspace.farms.length, 1);
  assert.equal(workspace.farms[0].name, 'Granja Fazenda');
  assert.match(workspace.farms[0].lots[0].name, /dados iniciais/);
  assert.equal(workspace.activeFarmId, workspace.farms[0].id);
  assert.equal(workspace.activeLotId, workspace.farms[0].lots[0].id);
  assert.equal(workspace.settings.theme, 'dark');
});

test('workspace parser accepts versioned farm and lot data', () => {
  const workspace = createInitialWorkspace();
  const parsed = parseWorkspaceData(JSON.stringify(workspace));
  assert.ok(parsed);
  assert.equal(parsed?.farms[0].lots[0].currentBirds, 5000);
  assert.equal(parsed?.settings.theme, 'dark');
});

test('workspace parser rejects invalid or incompatible persisted payloads', () => {
  assert.equal(parseWorkspaceData('not-json'), null);
  assert.equal(parseWorkspaceData(JSON.stringify({ schemaVersion: 2, farms: [] })), null);
  assert.equal(parseWorkspaceData(JSON.stringify({ schemaVersion: 1, farms: [] })), null);
});

test('workspace parser defaults older saved preferences to dark theme', () => {
  const workspace = createInitialWorkspace();
  const { theme: _theme, ...legacySettings } = workspace.settings;
  const legacyPayload = { ...workspace, settings: legacySettings };
  const parsed = parseWorkspaceData(JSON.stringify(legacyPayload));
  assert.equal(parsed?.settings.theme, 'dark');
});
