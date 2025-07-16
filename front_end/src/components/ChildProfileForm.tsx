// src/components/ChildProfileForm.tsx

import React from "react";
import { Button } from "./ui/Button";

// Define expected props for the ChildProfileForm component
interface ChildProfileFormProps {
  formData: {
    name: string;
    birth_date: string;
    age: string;
    gender: string;
    behavioral_patterns: { mood: string };
    emotional_state: { status: string };
  };
  formErrors: { [key: string]: string };  // Form validation error messages
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;  // Handler for simple input changes
  onSelectChange: (field: string, value: string) => void;      // Handler for select/complex inputs
  onSubmit: (e: React.FormEvent) => void;                      // Form submission handler
  onCancel: () => void;                                        // Cancel/reset handler
}

// Utility function to calculate age from a birth date
const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Main child profile form component
const ChildProfileForm: React.FC<ChildProfileFormProps> = ({
  formData,
  formErrors,
  onChange,
  onSelectChange,
  onSubmit,
  onCancel,
}) => {

  // Handle birth date input and auto-calculate age
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (value) {
      const birthDate = new Date(value);
      const age = calculateAge(birthDate);

      // Update birth_date in form state
      onChange({
        ...e,
        target: {
          ...e.target,
          name: "birth_date",
          value,
        },
      });

      // Update age in form state (as string)
      onChange({
        ...e,
        target: {
          ...e.target,
          name: "age",
          value: age.toString(),
        },
      });
    } else {
      onChange(e);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">

      {/* Child Name Input */}
      <div>
        <label htmlFor="name" className="block font-medium mb-1">
          Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name || ""}
          onChange={onChange}
          className="w-full px-3 py-2 border rounded"
        />
        {formErrors.name && (
          <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
        )}
      </div>

      {/* Birth Date Picker */}
      <div>
        <label htmlFor="birth_date" className="block font-medium mb-1">
          Birth Date
        </label>
        <input
          type="date"
          name="birth_date"
          value={formData.birth_date || ""}
          onChange={handleDateChange}
          className="w-full px-3 py-2 border rounded"
        />
        {formErrors.birth_date && (
          <p className="text-red-500 text-sm mt-1">{formErrors.birth_date}</p>
        )}
      </div>

      {/* Gender Dropdown */}
      <div>
        <label htmlFor="gender" className="block font-medium mb-1">
          Gender
        </label>
        <select
          name="gender"
          value={formData.gender || ""}
          onChange={(e) => onSelectChange("gender", e.target.value)}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
          {/* Optional choices can be enabled below */}
          {/* <option value="other">Other</option> */}
          {/* <option value="unspecified">Prefer not to say</option> */}
        </select>
      </div>

      {/* Mood Input */}
      <div>
        <label htmlFor="mood" className="block font-medium mb-1">
          Mood
        </label>
        <input
          type="text"
          name="behavioral_patterns.mood"
          value={formData.behavioral_patterns.mood || ""}
          onChange={(e) =>
            onSelectChange("behavioral_patterns.mood", e.target.value)
          }
          className="w-full px-3 py-2 border rounded"
        />
        {formErrors.mood && (
          <p className="text-red-500 text-sm mt-1">{formErrors.mood}</p>
        )}
      </div>

      {/* Emotional Status Input */}
      <div>
        <label htmlFor="status" className="block font-medium mb-1">
          Emotional Status
        </label>
        <input
          type="text"
          name="emotional_state.status"
          value={formData.emotional_state.status || ""}
          onChange={(e) =>
            onSelectChange("emotional_state.status", e.target.value)
          }
          className="w-full px-3 py-2 border rounded"
        />
        {formErrors.status && (
          <p className="text-red-500 text-sm mt-1">{formErrors.status}</p>
        )}
      </div>

      {/* Save/Cancel Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

// Export component
export default ChildProfileForm;
