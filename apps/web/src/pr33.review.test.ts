import { expect, it } from 'vitest';
import { splitClauses } from './clauses';

it.each([
  ['2150','Monthly rent:\n2150\npayable on the first day.'],
  ['2026','Effective year:\n2026\nThe parties agree.'],
  ['1234','Account last four:\n1234\nUse these details.'],
])('preserves substantive standalone value %s before analysis', (value,input) => {
  expect(splitClauses(input).map(c=>c.text).join('\n')).toContain(value);
});

it('still removes explicit page furniture without dropping bare values',()=>{
  const result=splitClauses('Contract.\n\nPage 3 of 7\n\n- 4 -\n\nMonthly fee:\n2150');
  expect(result.map(c=>c.text)).toEqual(['Contract.','Monthly fee:\n2150']);
});
