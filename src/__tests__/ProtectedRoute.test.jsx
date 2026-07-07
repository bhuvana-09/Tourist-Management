import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import ProtectedRoute from "../auth/ProtectedRoute";
import { useAuth } from "../context/AuthContext";

// Mock useAuth
vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn()
}));

// Mock react-router-dom's Navigate component
vi.mock("react-router-dom", () => ({
  Navigate: vi.fn(({ to }) => <div data-testid="navigate" data-to={to} />)
}));

describe("ProtectedRoute Component Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display a loading spinner while authentication status is being checked", () => {
    useAuth.mockReturnValue({
      user: null,
      loading: true
    });

    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
  });

  it("should redirect unauthenticated users to the login route", () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false
    });

    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    const navigateEl = screen.getByTestId("navigate");
    expect(navigateEl).toBeInTheDocument();
    expect(navigateEl.getAttribute("data-to")).toBe("/login");
  });

  it("should render the child content when user is authenticated and authorized", () => {
    useAuth.mockReturnValue({
      user: { id: "123", name: "John", role: "user" },
      loading: false
    });

    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
  });

  it("should redirect authenticated but unauthorized users to the home route if role mismatch", () => {
    useAuth.mockReturnValue({
      user: { id: "123", name: "John", role: "user" },
      loading: false
    });

    render(
      <ProtectedRoute roles={["admin"]}>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    const navigateEl = screen.getByTestId("navigate");
    expect(navigateEl).toBeInTheDocument();
    expect(navigateEl.getAttribute("data-to")).toBe("/");
  });
});
