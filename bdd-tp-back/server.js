const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');

const mysql = require('mysql2');
const { performance } = require('perf_hooks');

if (typeof performance === 'undefined') {
    global.performance = require('perf_hooks').performance;
}
const { MongoClient, ObjectId } = require('mongodb');

const app = express();

// Conexión a la BDD MySQL
const mysqlDB = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'sinclair',
  database: 'mydatabase'
});

mysqlDB.connect((err) => {
  if (err) {
      console.error('Error al conectar con la bdd MySQL:', err);
      process.exit(1);
  }
  console.log('Conectado a la base de datos MySQL');
});

// Conexión a la BDD MongoDB
const uri = "mongodb://localhost:27017/employeesMongo";
const client = new MongoClient(uri);

async function connectMongo() {
  try {
    await client.connect();
    console.log("Conectado a MongoDB");
  } catch (error) {
    console.error("Error al conectar con la bdd MongoDB:", error);
    process.exit(1);
  }
}

connectMongo();

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
    mysqlDB.query('SELECT * FROM employees', (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error al obtener empleados', error: err });
        }
        res.status(200).json({ employees: results });
    });
  });

  app.get('/api/resumes/:id', async (req, res) => {
    const resumeId = req.params.id;
    try {
        const mongoDB = client.db("employeesMongo");
        const resumesColeccion = mongoDB.collection("resumes");

        // Buscar el resume en MongoDB
        const resume = await resumesColeccion.findOne({ _id: new ObjectId(resumeId) });

        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        res.sendFile(path.resolve(resume.filepath));

    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el resume' });
    }
});

app.post('/api/employees', upload.single('resume'), async (req, res) => {
  const { name, age, position } = req.body;
  const fileData = req.file;

  if (!name || !age || !position) {
      return res.status(400).json({ message: 'Faltan datos para crear el empleado' });
  }

  try {
    const mongoDB = client.db("employeesMongo");
    const resumesColeccion = mongoDB.collection("resumes");

    const newResume = {
      filename: fileData.filename,
      filepath: fileData.path,
      originalname: fileData.originalname,
      uploadDate: new Date()
    };

    const resumeResult = await resumesColeccion.insertOne(newResume);
    const resumeId = resumeResult.insertedId.toString();

    // Insertar el nuevo empleado en la bdd mysql
    mysqlDB.query(
      'INSERT INTO employees (name, age, position, resume_id) VALUES (?, ?, ?, ?)',
      [name, age, position, resumeId],
      (err, result) => {
          if (err) {
            console.error('Error al insertar el empleado en MySQL:', err);
            return res.status(500).json({ message: 'Error al guardar el empleado', error: err });
          }
          const employeeId = result.insertId;
          const newEmployee = {
            id: employeeId,
            name,
            age,
            position,
            resume_id: resumeId
        };
        res.status(201).json({
            message: 'Empleado creado con éxito',
            employee: newEmployee
        });
      });
    } catch (error) {
        console.error('Error interno del servidor:', error);
        return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});

app.delete('/api/employees/:id', async (req, res) => {
  const employeeId = req.params.id;

  if (!employeeId) {
    return res.status(400).json({ message: 'Falta el ID del empleado' });
  }

  // Primero obtengo el resume_id del employee que quiero eliminar
  mysqlDB.query(
    'SELECT resume_id FROM employees WHERE id = ?',
    [employeeId],
    async (err, results) => {
      if (err || results.length === 0) {
        return res.status(500).json({ message: 'Error al obtener el empleado', error: err });
      }

      const resumeId = results[0].resume_id;
      // Ahora borro el resume de mongoDB
      if (resumeId) {
        const mongoDB = client.db("employeesMongo");
        const resumesCollection = mongoDB.collection("resumes");
        await resumesCollection.deleteOne({ _id: resumeId });
      }
      // Por ultimo, elimino el employee
      mysqlDB.query(
        'DELETE FROM employees WHERE id = ?',
        [employeeId],
        (deleteErr, deleteResult) => {
          if (deleteErr) {
            return res.status(500).json({ message: 'Error al eliminar el empleado' });
          }

          if (deleteResult.affectedRows === 0) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
          }
      return res.status(200).json({ message: 'Empleado eliminado con éxito' });
    });
  });
});

app.put('/api/employees/:id', upload.single('resume'), async (req, res) => {
  const employeeId = req.params.id;
  const { name, age, position } = req.body;

  if (!employeeId || !name || !age || !position) {
    return res.status(400).json({ message: 'Faltan datos del empleado' });
  }

  try {
    mysqlDB.query(
      'UPDATE employees SET name = ?, age = ?, position = ? WHERE id = ?',
      [name, age, position, employeeId],
      async (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Error al actualizar el empleado' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Empleado no encontrado' });
        }

        // Recuperar el resume_id actual antes de la actualización
        mysqlDB.query(
          'SELECT resume_id FROM employees WHERE id = ?',
          [employeeId],
          async (err, rows) => {
            if (err) {
              return res.status(500).json({ message: 'Error al obtener el resume_id actual', error: err });
            }

            const currentResumeId = rows[0]?.resume_id;

        // Si actualizo el resume
        const fileData = req.file;
        if (fileData ) {
          const mongoDB = client.db("employeesMongo");
          const resumesColeccion = mongoDB.collection("resumes");

          const newResume = {
            filename: fileData.filename,
            filepath: fileData.path,
            originalname: fileData.originalname,
            uploadDate: new Date()
          };
          const resumeResult = await resumesColeccion.insertOne(newResume);
          const newResumeId = resumeResult.insertedId;

          mysqlDB.query(
            'UPDATE employees SET resume_id = ? WHERE id = ?',
            [newResumeId.toString(), employeeId],
            (updateErr) => {
              if (updateErr) {
                return res.status(500).json({ message: 'Error al asociar el resume con el empleado', error: updateErr });
              }

              res.status(200).json({
                message: 'Empleado editado con éxito',
                employee: {
                  id: employeeId,
                  name,
                  age,
                  position,
                  resumeId: newResumeId
                }
              });
          });
          } else {
            // Si no se agrego resume
            res.status(200).json({
              message: 'Empleado editado con éxito',
              employee: {
                id: employeeId,
                name,
                age,
                position,
                resumeId: currentResumeId
              }
            });
          }
        });
      });
    } catch (error) {
      console.error('Error al editar el empleado:', error);
      return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});

// Start the server
app.listen(3001, () => {
  console.log('Server started on port 3001');
});