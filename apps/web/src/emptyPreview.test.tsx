import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Output } from './Workbench';

it('describes the empty preview without claiming nothing was ever sent', () => {
  // The empty state returns after a document is deleted or replaced, possibly after an earlier approved send.
  const html = renderToStaticMarkup(<Output run={null} active={null} onActive={() => {}} />);
  expect(html).toContain('Nothing is sent until you approve.');
  expect(html).toContain('Detected names');
  expect(html).not.toMatch(/left this device|never leaves|nothing leaves/i);
});
