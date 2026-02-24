import React, { ReactElement, ReactNode } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "@/store";

const MockLanguageProvider = ({ children }: { children: ReactNode }) => (
  <div data-testid="language-provider">{children}</div>
);

const AllTheProviders = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>
    <MockLanguageProvider>{children}</MockLanguageProvider>
  </Provider>
);

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, {
    wrapper: AllTheProviders,
    ...options,
  });
}

export * from "@testing-library/react";
export { customRender as render };
