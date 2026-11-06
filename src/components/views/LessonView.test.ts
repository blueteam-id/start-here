import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import LessonView from './LessonView.astro';

const track = { slug: 'computing-basics', data: { title: 'How a Computer Actually Works' } } as any;
const lessons = [
  { slug: 'computing-basics/01-what-is-a-computer', data: { title: 'What Is a Computer', phase: 'Orientation', order: 1 } },
  { slug: 'computing-basics/02-storage', data: { title: 'Storage and Data', phase: 'Core Concepts', order: 2, prerequisites: 'Finish lesson 1 first.' } },
] as any[];
const Content = () => '<p>lesson body</p>';

test('shows the prerequisites callout only when the lesson has one', async () => {
  const container = await AstroContainer.create();
  const htmlNoPrereq = await container.renderToString(LessonView, {
    props: { track, lessons, lesson: lessons[0], Content },
  });
  expect(htmlNoPrereq).not.toMatch(/PREREQUISITES/i);

  const htmlWithPrereq = await container.renderToString(LessonView, {
    props: { track, lessons, lesson: lessons[1], Content },
  });
  expect(htmlWithPrereq).toMatch(/PREREQUISITES/i);
  expect(htmlWithPrereq).toContain('Finish lesson 1 first.');
});

test('renders Reflect and Go further sections with the given content', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(LessonView, {
    props: { track, lessons, lesson: lessons[0], Content, reflectQuestions: ['Why does this matter?'], resources: [{ label: 'A book', url: 'https://example.com/book' }] },
  });
  expect(html).toMatch(/Reflect on your own/i);
  expect(html).toContain('Why does this matter?');
  expect(html).toMatch(/Go further/i);
  expect(html).toContain('https://example.com/book');
});
