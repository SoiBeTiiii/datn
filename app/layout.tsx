import "@mantine/core/styles.css";

import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { HeaderSearch } from "./components/HeaderSearch";
import { MantineProvider } from "./providers/MatineProviders";
export const metadata = {
  title: "My Mantine app",
  description: "I have followed setup instructions carefully",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>
          <HeaderSearch /> 
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
