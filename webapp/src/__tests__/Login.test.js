import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import { SessionContext } from "../SessionContext";
import axios from "axios";

jest.mock("axios");

describe("Login Page", () => {
  const mockCreateSession = jest.fn();
  const mockUpdateAvatar = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    render(
      <SessionContext.Provider value={{ createSession: mockCreateSession, updateAvatar: mockUpdateAvatar }}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </SessionContext.Provider>
    );
  });

  test("renders input fields and login button", () => {
    expect(screen.getByLabelText(/Login.username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Login.password/i)).toBeInTheDocument();
    expect(screen.getByText(/Login.button/i)).toBeInTheDocument();
  });

  test("successful login redirects and updates session", async () => {
    axios.post.mockResolvedValue({ data: { avatar: "avatar-url" } });

    fireEvent.change(screen.getByLabelText(/Login.username/i), { target: { value: "testuser" } });
    fireEvent.change(screen.getByLabelText(/Login.password/i), { target: { value: "password" } });
    fireEvent.click(screen.getByText(/Login.button/i));

    await waitFor(() => expect(axios.post).toHaveBeenCalledWith("http://localhost:8000/login", { username: "testuser", password: "password" }));
    expect(mockUpdateAvatar).toHaveBeenCalledWith("avatar-url");
    expect(mockCreateSession).toHaveBeenCalledWith("testuser");
  });

  test("displays error message on failed login", async () => {
    axios.post.mockRejectedValue({ response: { data: { error: "Invalid credentials" } } });

    fireEvent.change(screen.getByLabelText(/Login.username/i), { target: { value: "wronguser" } });
    fireEvent.change(screen.getByLabelText(/Login.password/i), { target: { value: "wrongpass" } });
    fireEvent.click(screen.getByText(/Login.button/i));

    await waitFor(() => expect(screen.getByText(/Error: Invalid credentials/i)).toBeInTheDocument());
  });
});