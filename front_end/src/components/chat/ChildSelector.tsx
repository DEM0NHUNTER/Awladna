// src/components/chat/ChildSelector.tsx

import React from 'react';

/**
 * Child object type definition
 * - id: Unique identifier of child
 * - name: Child's name
 * - age: Child's age (number)
 */
interface Child {
  id: number;
  name: string;
  age: number;
}

/**
 * Props expected by ChildSelector component:
 * - childrenList: Array of Child objects for dropdown options
 * - selectedChildId: Currently selected child (id)
 * - onSelect: Function to handle child selection change
 */
interface Props {
  childrenList: Child[];
  selectedChildId: number | null;
  onSelect: (child: Child) => void;
}

/**
 * ✅ ChildSelector Component:
 * - Dropdown for selecting a child profile.
 * - On selection, calls parent-provided onSelect handler.
 */
const ChildSelector: React.FC<Props> = ({ childrenList, selectedChildId, onSelect }) => {
  return (
    <div className="px-4 py-2">

      {/* Label */}
      <label className="text-sm font-medium text-gray-600 mr-2">
        Chat about:
      </label>

      {/* Dropdown */}
      <select
        className="px-2 py-1 border rounded"
        value={selectedChildId ?? ''}                       // Fallback to empty string if null
        onChange={(e) => {
          // When option changes, find corresponding child object
          const selected = childrenList.find(
            c => c.id === Number(e.target.value)
          );

          // If valid child found, trigger onSelect callback
          if (selected) onSelect(selected);
        }}
      >
        <option value="">Select a child</option>

        {/* Generate dropdown options dynamically */}
        {childrenList.map(child => (
          <option key={child.id} value={child.id}>
            {child.name} (age {child.age})
          </option>
        ))}
      </select>

    </div>
  );
};

export default ChildSelector;
