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

      const addResume = async () => {
        if (resume) {
          const formData = new FormData();
          formData.append('resume', resume); // Agregar el archivo al FormData

          try {
            const response = await axios.post('http://localhost:3001/api/resumes', formData);
            return response.data;
          } catch (error) {
            // Manejar errores
            console.error('Error al subir el archivo:', error);
            throw error;
          }
        };
      };

    const addEmployee = async (event) => {
        event.preventDefault();
        try {
          if (!newEmployee.name || !newEmployee.age || !newEmployee.position) {
            alert("Please, complete all mandatory fields");
            return;
          }

          let uploadedResume = null;
            if (resume) {
                uploadedResume = await addResume();
                document.getElementById('file').value = '';
                setResume(null);
            }
            const employeeWithResume = {
              ...newEmployee,
              resume: uploadedResume ? uploadedResume.resume : null
            };

            await axios.post('http://localhost:3001/api/employees', employeeWithResume );
            // Actualizo la lista despues de agregar un employee
            const employeesResponse = await axios.get('http://localhost:3001/api/employees');

            // Limpio los campos
            setEmployees(employeesResponse.data.employees);
            setNewEmployee({ name: '', age: '', position: '' });
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
                <h4>Actions</h4>
            </div>
            <Employees employees={employees} setEmployees={setEmployees} />
      </header>
    </div>
  );
}

export default App;
