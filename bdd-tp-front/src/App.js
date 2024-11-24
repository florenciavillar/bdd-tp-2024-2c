import React, { useState, useEffect } from 'react';
import './App.css';
import Employees from './Employees';
import axios from 'axios';

function App() {
    const [ employees, setEmployees ] = useState([]);
    const [ newEmployee, setNewEmployee ] = useState({
        name: '',
        age: '',
        position: ''
      });
    const [ resume, setResume ] = useState(null);

    useEffect(() => {
      const fetchEmployees = async () => {
        try {
          const response = await axios.get('http://localhost:3001/api/employees');
          setEmployees(response.data.employees || []);
        } catch (error) {
          console.error('Error al cargar los empleados:', error);
        }
      };
      fetchEmployees();
    }, []);

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      setResume(file);
    };

    const addEmployee = async (event) => {
      event.preventDefault();
      try {
        if (!newEmployee.name || !newEmployee.age || !newEmployee.position || !resume) {
          alert("Please, complete all mandatory fields");
          return;
        }

        const formData = new FormData();
        formData.append('name', newEmployee.name);
        formData.append('age', newEmployee.age);
        formData.append('position', newEmployee.position);

        if (resume) {
          formData.append('resume', resume);
        }

        const response = await axios.post('http://localhost:3001/api/employees', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Response from server:', response.data);

        // Actualizo la lista despues de agregar un employee
        const employeesResponse = await axios.get('http://localhost:3001/api/employees');

        // Limpio los campos
        setEmployees(employeesResponse.data.employees);
        setNewEmployee({ name: '', age: '', position: '' });
        setResume(null);
        document.getElementById('file').value = '';

        alert('Employee created successfully!');
      } catch(error) {
          alert('Error saving the employee');
      };
    };

  return (
    <div className="App">
      <header className="App-header">
        <h2>My employees</h2>
        <form onSubmit={addEmployee}>
                <div className="form-group">
                    <label>Name:</label>
                    <input
                        type="text"
                        placeholder="Name"
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Age:</label>
                    <input
                        type="number"
                        placeholder="Age"
                        value={newEmployee.age}
                        onChange={(e) => setNewEmployee({ ...newEmployee, age: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Position:</label>
                    <input
                        type="text"
                        placeholder="Position"
                        value={newEmployee.position}
                        onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Resume:</label>
                    <input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                    />
                </div>
                <button type="submit">Add Employee</button>
            </form>
            <div className='headers'>
                <h4>Name</h4>
                <h4>Age</h4>
                <h4>Position</h4>
                <h4>Resume</h4>
                <h4>Actions</h4>
            </div>
            <Employees employees={employees} setEmployees={setEmployees} />
      </header>
    </div>
  );
}

export default App;
