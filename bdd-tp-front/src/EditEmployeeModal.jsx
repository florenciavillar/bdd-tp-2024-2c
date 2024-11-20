import React, { useState, useEffect } from 'react';

import './EditEmployeeModal.css';

const EditEmployeeModal = ({ employee, onSubmit, onCancel }) => {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [position, setPosition] = useState('');

  useEffect(() => {
    setName(employee.name);
    setAge(employee.age);
    setPosition(employee.position);
  }, [employee]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !age || !position) {
      alert("Please, complete all mandatory fields");
      return;
    }

    const updatedEmployee = {
      id: employee.id,
      name: name,
      age: age,
      position: position,
    };

    onSubmit(updatedEmployee);
  };

    return (
        <div className="editEmployeeModal">
        <div className="modalContent">
          <h2>Edit Employee</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Age:</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Position:</label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
            </div>
            <div className="actions">
              <button type="submit">
                Save Employee
              </button>
              <button type="button" onClick={onCancel}>
                Cancel
              </button>
            </div>
          </form>
          </div>
        </div>
    )
  }
  
  export default EditEmployeeModal;