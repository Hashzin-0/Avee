import type { Metadata } from 'next';
import '../src/styles/global.css';
import 'pullcord/pullcord.css';
import { App } from '../src/app/App';

export const metadata: Metadata = {
  title: 'Granja | Gestão Avícola',
  description: 'Gestão avícola, pesagem de aves e planejamento de galpões.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body><App />{children}</body>
    </html>
  );
}
