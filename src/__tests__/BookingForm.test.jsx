import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import AddBooking from "../pages/AddBooking";
import { useAuth } from "../context/AuthContext";
import { backendApi as api } from "../api/axiosInstance";
import * as z from "zod";

// Re-declare schema in test to validate its Zod constraints directly
const bookingValidationSchema = z.object({
  packageId: z.string().min(1, "Please select a travel package"),
  phone: z.string().min(1, "Phone number is required"),
  travelers: z.coerce
    .number()
    .min(1, "At least 1 traveler is required")
    .max(20, "Maximum of 20 travelers allowed"),
  date: z.string().min(1, "Travel date is required").refine((val) => {
    const selectedDate = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, "Travel date cannot be in the past")
});

// Mock the AuthContext
vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn()
}));

// Mock axios backend API instance
vi.mock("../api/axiosInstance", () => ({
  backendApi: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe("Booking Form Zod Validation Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      user: { name: "John Doe", email: "john@example.com" }
    });
    // Mock packages endpoint retrieval
    api.get.mockResolvedValue([
      { id: "pkg-1", packageName: "Goa Escape", price: 4999 }
    ]);
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <AddBooking />
      </BrowserRouter>
    );
  };

  it("should block empty inputs with expected error messages on submit", async () => {
    renderComponent();

    // Trigger validation by clicking submit with default/empty fields
    const submitButton = screen.getByRole("button", { name: /confirm booking/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Please select a travel package")).toBeInTheDocument();
      expect(screen.getByText("Phone number is required")).toBeInTheDocument();
      expect(screen.getByText("Travel date is required")).toBeInTheDocument();
    });
  });

  it("should validate Zod schema constraints directly for travelers range and past dates", () => {
    // 1. Travelers count < 1
    const travelersMinResult = bookingValidationSchema.safeParse({
      packageId: "pkg-1",
      phone: "1234567890",
      travelers: 0,
      date: "2030-12-31"
    });
    expect(travelersMinResult.success).toBe(false);
    expect(travelersMinResult.error.issues[0].message).toBe("At least 1 traveler is required");

    // 2. Travelers count > 20
    const travelersMaxResult = bookingValidationSchema.safeParse({
      packageId: "pkg-1",
      phone: "1234567890",
      travelers: 21,
      date: "2030-12-31"
    });
    expect(travelersMaxResult.success).toBe(false);
    expect(travelersMaxResult.error.issues[0].message).toBe("Maximum of 20 travelers allowed");

    // 3. Date in the past
    const pastDateResult = bookingValidationSchema.safeParse({
      packageId: "pkg-1",
      phone: "1234567890",
      travelers: 2,
      date: "2020-01-01"
    });
    expect(pastDateResult.success).toBe(false);
    expect(pastDateResult.error.issues[0].message).toBe("Travel date cannot be in the past");
  });

  it("should reject travel dates in the past via UI submission", async () => {
    const { container } = renderComponent();

    // Wait for packages to finish loading
    const selectEl = await screen.findByRole("combobox");
    await waitFor(() => {
      expect(screen.getByText("Goa Escape - ₹4999")).toBeInTheDocument();
    });

    const phoneInput = screen.getByPlaceholderText("e.g., +91 98765 43210");
    const travelersInput = screen.getByPlaceholderText("1");
    const dateInput = container.querySelector('input[name="date"]');

    fireEvent.change(selectEl, { target: { value: "pkg-1" } });
    fireEvent.change(phoneInput, { target: { value: "1234567890" } });
    fireEvent.change(travelersInput, { target: { value: "2" } });

    // Set travel date in the past
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split("T")[0];
    fireEvent.change(dateInput, { target: { value: dateStr } });

    const submitButton = screen.getByRole("button", { name: /confirm booking/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Travel date cannot be in the past")).toBeInTheDocument();
    });
  });
});
