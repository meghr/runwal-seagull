import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
// import { ThemeProvider } from "@/components/theme-provider" // Uncomment if using theme provider

// Add any providers here (Theme, Auth, QueryClient, etc.)
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        // <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <>
            {children}
        </>
        // </ThemeProvider>
    );
};

const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from "@testing-library/react";
export { customRender as render };
