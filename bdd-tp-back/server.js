const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const mysql = require('mysql2');

// Crear conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Cambia este valor si tu usuario es diferente
  password: 'sinclair', // Cambia por la contraseña de tu base de datos
  database: 'mydatabase' // Cambia por el nombre de tu base de datos
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
      console.error('Error al conectar con la base de datos:', err);
      process.exit(1); // Salir si hay un error de conexión
  }
  console.log('Conectado a la base de datos MySQL');
});

// Next initialize the application
const app = express();
app.use(express.json());
app.use(bodyParser.json());

const corsOptions = {
    origin: 'http://localhost:3000',  // Permite solo solicitudes desde el frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE']
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
    db.query('SELECT * FROM employees', (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener empleados', error: err });
        }
        res.status(200).json({ employees: results });
    });
});

app.post('/api/employees', (req, res) => {
  const { name, age, position } = req.body;

  if (!name || !age || !position) {
      return res.status(400).json({ message: 'Faltan datos para crear el empleado' });
  }

  // Insertar el nuevo empleado en la base de datos
  db.query(
      'INSERT INTO employees (name, age, position) VALUES (?, ?, ?)',
      [name, age, position],
      (err, result) => {
          if (err) {
              return res.status(500).json({ message: 'Error al guardar el empleado', error: err });
          }

          // Responder con el empleado creado
          const newEmployee = {
              id: result.insertId,
              name,
              age,
              position
          };
          res.status(201).json({
              message: 'Empleado creado con éxito',
              employee: newEmployee
          });
      }
  );
});

app.delete('/api/employees/:id', (req, res) => {
  const employeeId = req.params.id;

  if (!employeeId) {
    return res.status(400).json({ message: 'Falta el ID del empleado' });
  }

  const query = 'DELETE FROM employees WHERE id = ?';
  db.query(query, [employeeId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error al eliminar el empleado' });
    }

    // Si el numero de filas afectadas en la tabla employees es cero,
    // no encontro el empleado de ese id
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    return res.status(200).json({ message: 'Empleado eliminado con éxito' });
  });
});

app.put('/api/employees/:id', (req, res) => {
  const employeeId = req.params.id;
  const { name, age, position } = req.body;

  if (!employeeId || !name || !age || !position) {
    return res.status(400).json({ message: 'Faltan datos del empleado' });
  }

  const query = 'UPDATE employees SET name = ?, age = ?, position = ? WHERE id = ?';
  db.query(query, [name, age, position, employeeId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error al actualizar el empleado' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }

    return res.status(200).json({ message: 'Empleado actualizado con éxito' });
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
        return res.status(500).json({ message: 'Error al leer resumes JSON' });
      }

      let resumes = [];
      if (fileContent) {
        try {
          resumes = JSON.parse(fileContent); // Convertir el JSON a un arreglo
        } catch (parseErr) {
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