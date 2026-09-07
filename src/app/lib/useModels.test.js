import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getCost, IMAGE_COSTS, VIDEO_COSTS } from './credits.js';
import { parseModels } from './useModels.js';

test('renamed catalog models retain configured credit prices and the Flux default', () => {
  for (const [action, costs] of [['image', IMAGE_COSTS], ['video', VIDEO_COSTS]]) {
    for (const [id, cost] of Object.entries(costs)) {
      const { all } = parseModels([{
        name: `publisher/${id}`,
        aliases: ['another-alias', id],
        input_modalities: ['text'],
        output_modalities: [action],
      }]);
      assert.equal(all[0].id, id);
      assert.equal(getCost(action, all[0].id), cost);
      assert.equal(getCost('blueprint', all[0].id), cost + 1);
      if (id === 'flux') assert.doesNotThrow(() => all.find((m) => m.id === 'flux').label);
    }
  }
});

test('existing priced names take precedence and new models keep their canonical names', () => {
  const { all } = parseModels([
    { name: 'flux', aliases: ['gptimage'], output_modalities: ['image'] },
    { name: 'publisher/new-model', aliases: ['new-model'], output_modalities: ['image'] },
    { name: 'another/new-model', output_modalities: ['image'] },
  ]);
  assert.deepEqual(all.map((m) => m.id), ['flux', 'publisher/new-model', 'another/new-model']);
});
