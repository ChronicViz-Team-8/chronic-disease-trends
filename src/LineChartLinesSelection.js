import React, { useState } from 'react';
import { Checkbox, ListItemText, MenuItem, Select, InputLabel, FormControl } from '@mui/material';

const LineSelection = ({ onSelectionChange }) => {
  const options = [
    'Male',
    'Female',
    'White, non-Hispanic',
    'Black, non-Hispanic',
    'Hispanic',
    'Other, non-Hispanic',
    'U.S. Regions',
  ];

  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleChange = (event) => {
    const { value } = event.target;

    let updatedSelection;
    if (value.includes('U.S. Regions') && !selectedOptions.includes('U.S. Regions')) {
      // If "U.S. Regions" is selected, deselect all other options
      updatedSelection = ['U.S. Regions'];
    } else if (selectedOptions.includes('U.S. Regions') && !value.includes('U.S. Regions')) {
      // If "U.S. Regions" is deselected, allow other options
      updatedSelection = value.filter(item => item !== 'U.S. Regions')
    } else {
      updatedSelection = value;
    }

    setSelectedOptions(updatedSelection);
    onSelectionChange(updatedSelection);
  };

  const isRegionsSelected = selectedOptions.includes('U.S. Regions');
  const isOtherSelected = selectedOptions.some((item) => item !== 'U.S. Regions');

  return (
    <FormControl sx={{ width: 250 }}>
      <InputLabel>Add Demographic Line</InputLabel>
      <Select
        multiple
        value={selectedOptions}
        onChange={handleChange}
        renderValue={(selected) => selected.join(', ')}
        label={'Add Demographic Line'}
      >
        {options.map((option) => (
          <MenuItem
            key={option}
            value={option}
            disabled={
              (option !== 'U.S. Regions' && isRegionsSelected) ||
              (option === 'U.S. Regions' && isOtherSelected)
            }
          >
            <Checkbox checked={selectedOptions.indexOf(option) > -1} />
            <ListItemText primary={option} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LineSelection;
