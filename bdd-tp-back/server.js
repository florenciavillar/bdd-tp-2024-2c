const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');

// Next initialize the application
const app = express();
app.use(express.json());
app.use(bodyParser.json());

const corsOptions = {
    origin: 'http://localhost:3000',  // Permite solo solicitudes desde el frontend
    methods: ['GET', 'POST']
  };
  app.use(cors(corsOptions));

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, 'uploads')); 
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  
  const upload = multer({ storage: storage });

app.get('/api/employees', (req, res) => {
    // Leer el archivo JSON donde almacenamos los empleados
    fs.readFile(path.join(__dirname, 'employees.json'), 'utf8', (err, data) => {
      if (err) {
        return res.status(500).json({ message: 'Error al leer los empleados' });
      }
  
      let employees = [];
      if (data) {
        employees = JSON.parse(data);
      }
  
      return res.status(200).json({ employees });
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
        employees = JSON.parse(data);
      }

    // Crear un objeto de empleado
    const newEmployee = {
      id: employees.length ? employees[employees.length - 1].id + 1 : 1,
      name,
      age,
      position,
    };
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

app.post('/api/resumes', upload.single('resume'), (req, res) => {
  try {
    const fileData = req.file;
    if (!fileData ) {
      return res.status(400).json({ message: 'No resume uploaded' });
    }

    const resumesFilePath = path.join(__dirname, 'resumes.json');

    // Leer el archivo JSON donde almacenamos los empleados
    fs.readFile(resumesFilePath, 'utf8', (err, fileContent) => {
      if (err) {
        console.error('Error al leer el archivo resumes.json:', err);
        return res.status(500).json({ message: 'Error al leer resumes JSON' });
      }

      let resumes = [];
      if (fileContent) {
        try {
          resumes = JSON.parse(fileContent); // Convertir el JSON a un arreglo
        } catch (parseErr) {
          console.error('Error al parsear el JSON:', parseErr);
          return res.status(500).json({ message: 'Error al procesar los datos' });
        }
      }

      const newResume = {
        id: resumes.length ? resumes[resumes.length - 1].id + 1 : 1,
        resume: fileData.path
      };
      resumes.push(newResume);

     // Guardar el arreglo de resumes actualizado en el archivo JSON
     fs.writeFile(resumesFilePath, JSON.stringify(resumes, null, 2), (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error al guardar el resume' });
        }
        console.log('Nuevo resume guardado correctamente');
        return res.status(201).json(newResume);
      });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Start the server
app.listen(3001, () => {
  console.log('Server started on port 3001');
});