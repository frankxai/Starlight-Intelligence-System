import type { Metadata } from 'next';
import { ConnectionGuide } from './ConnectionGuide';
import catalog from './catalog.json';

export const metadata: Metadata = {
  title: 'Connect your agents',
  description: 'Native agent interfaces, their ownership boundaries, and a pinned code review handoff.',
  alternates: { canonical: '/connect' },
};

export default function ConnectPage() {
  return <ConnectionGuide catalog={catalog} />;
}
