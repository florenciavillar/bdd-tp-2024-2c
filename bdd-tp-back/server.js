const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

// Next initialize the application
const app = express();
app.use(express.json());
app.use(bodyParser.json());

const corsOptions = {
    origin: 'http://localhost:3001',  // Permite solo solicitudes desde el frontend
    methods: ['GET', 'POST'],  // Métodos permitidos
    allowedHeaders: ['Content-Type'],  // Cabeceras permitidas
  };
  
  // Usar CORS con las opciones especificadas
  app.use(cors(corsOptions));

app.get('/api/employees', (req, res) => {
    // Leer el archivo JSON donde almacenamos los empleados
    fs.readFile(path.join(__dirname, 'employees.json'), 'utf8', (err, data) => {
      if (err) {
        return res.status(500).json({ message: 'Error al leer los empleados' });
      }
  
      let employees = [];
      if (data) {
        employees = JSON.parse(data); // Parseamos el archivo JSON
      }
  
      return res.status(200).json({ employees }); // Devolvemos los empleados en formato JSON
    });
  });

app.post('/api/employees', (req, res) => {
    const { name, age, position } = req.body;
  
    if (!name || !age || !position) {
      return res.status(400).json({ message: 'Faltan datos para crear el empleado' });
    }
  
    // Leer el archivo JSON donde almacenamos los empleados
    fs.readFile(path.join(__dirname, 'employees.json'), 'utf8', (err, data) => {
      if (err) {
        return res.status(500).json({ message: 'Error al leer los empleados' });
      }
  
      let employees = [];
      if (data) {
        employees = JSON.parse(data); // Parseamos el archivo JSON
      }

      // Crear un objeto de empleado
    const newEmployee = {
      id: employees.length ? employees[employees.length - 1].id + 1 : 1, // Usamos la fecha actual como un "ID" único
      name,
      age,
      position,
    };
  
      // Agregar el nuevo empleado al arreglo de empleados
      employees.push(newEmployee);
  
      // Guardar el arreglo de empleados actualizado en el archivo JSON
      fs.writeFile(path.join(__dirname, 'employees.json'), JSON.stringify(employees, null, 2), (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error al guardar el empleado' });
        }
  
        // Respondemos con el nuevo empleado creado
        return res.status(201).json({
          message: 'Empleado creado con éxito',
          employee: newEmployee,
        });
      });
    });
});
  

// Start the server
app.listen(3001, () => {
  console.log('Server started on port 3001');
});