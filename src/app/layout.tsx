import { Providers } from "./providers";

// I think this is just boilerplate to help wrap all of the other files into the correct 
// route I think. but Ion understand this part too too well. 

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Next.js wraps every page with this layout; `children` is the page */}
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
