import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "../Home";
import { SessionContext } from "../SessionContext";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n"; // Asegúrate de que este es el archivo correcto de configuración de i18next

const customRender = (ui, { providerProps, theme, ...renderOptions }) => {
  return render(
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme || createTheme()}>
        <SessionContext.Provider {...providerProps}>{ui}</SessionContext.Provider>
      </ThemeProvider>
    </I18nextProvider>,
    renderOptions
  );
};

describe("Home Component", () => {
  test("renders logo, button, and video", () => {
    customRender(<Home />, { providerProps: { value: { username: "" } } });

    expect(screen.getByAltText("Logo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByTestId("video")).toBeInTheDocument();
  });

  test("redirects to login when username is empty", () => {
    customRender(<Home />, { providerProps: { value: { username: "" } } });
    expect(screen.getByRole("button", { name: /home/i })).toHaveAttribute("href", "/login");
  });

  test("redirects to homepage when username is set", () => {
    customRender(<Home />, { providerProps: { value: { username: "testuser" } } });
    expect(screen.getByRole("button", { name: /home/i })).toHaveAttribute("href", "/homepage");
  });
});