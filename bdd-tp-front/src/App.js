import './App.css';
import React, { useState, useEffect } from 'react';
import Employees from './Employees';
import axios from 'axios';

function App() {
    const [ employees, setEmployees ] = useState([]);
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        age: '',
        position: ''
      });

      useEffect(() => {
        const fetchEmployees = async () => {
          try {
            const response = await axios.get('http://localhost:3001/api/employees');
            setEmployees(response.data.employees); // Actualizar el estado con los empleados
          } catch (error) {
            console.error('Error al cargar los empleados:', error);
          }
        };
        fetchEmployees();
      }, []);

    const addEmployee = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/api/employees', 
                newEmployee
            )
            // Actualizar la lista de empleados agregando el nuevo
            setEmployees([...employees, response.data.employee]);
            // Limpiar el formulario
            setNewEmployee({ name: '', age: '', position: '' });
        } catch(error) {
            console.error('Error al crear el empleado:', error);
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
                        type="age"
                        placeholder="Age"
                        value={newEmployee.age}
                        onChange={(e) => setNewEmployee({ ...newEmployee, age: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Position:</label>
                    <input
                        type="position"
                        placeholder="Position"
                        value={newEmployee.position}
                        onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
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
            <Employees employees={employees}/>
      </header>
    </div>
  );
}

export default App;
