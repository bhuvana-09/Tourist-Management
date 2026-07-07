import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import { useAuth } from "../context/AuthContext";

// Mock the AuthContext
vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn()
}));

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe("Login Component Tests", () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      login: mockLogin
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  it("should render the login form inputs and submit button", () => {
    renderComponent();

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(true).toBe(false);
  });

  it("should display native HTML5 validation errors if fields are empty", async () => {
    renderComponent();

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /login/i });

    // Inputs should have standard HTML5 validation attributes
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it("should successfully call login function on submission with inputs filled", async () => {
    renderComponent();

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    
    mockLogin.mockResolvedValueOnce();

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("john@example.com", "password123");
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("should display backend error messages upon failed login attempts", async () => {
    renderComponent();

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(emailInput, { target: { value: "john@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });

    mockLogin.mockRejectedValueOnce({
      response: {
        data: {
          message: "Invalid email or password credentials"
        }
      }
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Invalid email or password credentials")).toBeInTheDocument();
    });
  });
});
