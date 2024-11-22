import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchBar } from "./SearchBar";
import "@testing-library/jest-dom";

test("renders SearchBar and calls onChange when typing", () => {
    let query = ""; 
    const mockOnChange = jest.fn((e) => {
      query = e.target.value;
    });
  
    const { rerender } = render(<SearchBar query={query} onChange={mockOnChange} />);
  
    const input = screen.getByPlaceholderText(/Type a node label to filter/i);
    expect(input).toBeInTheDocument();
  
    fireEvent.change(input, { target: { value: "test" } });
  
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  
    rerender(<SearchBar query={query} onChange={mockOnChange} />);
  
    expect(input).toHaveValue("test");
  });
