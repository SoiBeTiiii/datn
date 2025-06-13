// app/providers/MantineProvider.tsx
'use client';

import { MantineProvider as CoreProvider, ColorSchemeScript } from '@mantine/core';

export function MantineProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ColorSchemeScript />
      <CoreProvider defaultColorScheme="light">
        {children}
      </CoreProvider>
    </>
  );
}
