import React, { useState } from 'react';
import { FaRegTrashCan } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import axios from 'axios';
import EditEmployeeModal from './EditEmployeeModal';

import './Employees.css';

const Employees = ({ employees, setEmployees }) => {
  const [editingEmployee, setEditingEmployee] = useState(null);

  const deleteEmployee = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:3001/api/employees/${id}`);
      if (response.status === 200) {
        const employeesResponse = await axios.get('http://localhost:3001/api/employees');
        setEmployees(employeesResponse.data.employees);
        alert('Employee deleted successfully!');
      }
    } catch (error) {
      alert('Error deleting the employee');
    }
  };

  const editEmployee = (employee) => {
    setEditingEmployee(employee);
  };

  const updateEmployee = async (updatedEmployee) => {
    try {
      const formData = new FormData();
      formData.append('name', updatedEmployee.name);
      formData.append('age', updatedEmployee.age);
      formData.append('position', updatedEmployee.position);
      
      if (updatedEmployee.resume) {
        formData.append('resume', updatedEmployee.resume);
      }
  
      if (updatedEmployee.deleteResume) {
        formData.append('deleteResume', true);
      }

      const response = await axios.put(`http://localhost:3001/api/employees/${updatedEmployee.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        const updatedEmployees = employees.map(employee =>
          employee.id === updatedEmployee.id
            ? updatedEmployee : employee
        );
        setEmployees(updatedEmployees);
        alert('Employee updated successfully!');
        setEditingEmployee(null);
      }
    } catch (error) {
      alert('Error saving the employee');
    }
  };

  const cancelEdit = () => {
    setEditingEmployee(null);
  };

    return (
      <div className="Employees">
        {employees?.map((employee) => (
          <div className="employee" key={employee.id}>
            <div className='name'>
              <img className="avatar" src={require("./images/avatar.png")} alt="avatar" />
              <p>{employee.name}</p>
            </div>
            <p className="age">
              {employee.age}
            </p>
            <p className="position">
              {employee.position}
            </p>
            {employee.resume_id && (
                <a href={`http://localhost:3001/api/resumes/${employee.resume_id}`} target="_blank" rel="noopener noreferrer">
                    Download Resume
                </a>
            )}
            <div className="actions">
              <FaRegTrashCan onClick={() => deleteEmployee(employee.id)} />
              <FaEdit onClick={() => editEmployee(employee)} />
            </div>
          </div>
        ))}

        {editingEmployee && (
          <EditEmployeeModal
            employee={editingEmployee}
            onSubmit={updateEmployee}
            onCancel={cancelEdit}
          />
        )}
      </div>
    )
  }
  
  export default Employees;