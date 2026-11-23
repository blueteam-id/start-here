import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Callout from './Callout.astro';

test('renders the label for its type and the slotted text', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Callout, {
    props: { type: 'warning' },
    slots: { default: 'Open an admin prompt first.' },
  });
  expect(html).toContain('callout--warning');
  expect(html).toContain('Careful');
  expect(html).toContain('Open an admin prompt first.');
});

test('defaults to a note, and a custom title replaces the label', async () => {
  const container = await AstroContainer.create();
  const plain = await container.renderToString(Callout, { slots: { default: 'x' } });
  expect(plain).toContain('callout--note');
  const titled = await container.renderToString(Callout, { props: { type: 'tip', title: 'Shortcut' }, slots: { default: 'x' } });
  expect(titled).toContain('Shortcut');
  expect(titled).not.toContain('>Tip<');
});

test('an unknown type fails loudly', async () => {
  const container = await AstroContainer.create();
  await expect(container.renderToString(Callout, { props: { type: 'danger' } as any })).rejects.toThrow(/unknown type/);
});
