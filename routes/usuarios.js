const express = require('express');
const router = express.Router();
const pool = require('../config/db');  

//POST - Crear un nuevo usuario
router.post('/', async (req, res) => {
    const { nombre, correo } = req.body;

    if (!nombre || !correo) {
        return res.status(400).json({ error: 'Nombre y correo son requeridos' });
    }

    try{
        const result = await pool.query(
        'INSERT INTO usuarios (nombre, correo) VALUES ($1, $2) RETURNING *',
        [nombre, correo]
        );
        res.status(201).json({ message: 'Usuario creado exitosamente', id: result.rows[0].id });
    } catch (error) {

        if(error.code === '23505') { // Código de error para violación de clave única
           return res.status(409).json({ error: 'El correo ya está registrado' });
        }
       return res.status(500).json({ error: 'Error interno del servidor' });
    }
       
    });

    //PUT actualizar correo de un usuario
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).json({ error: 'Correo es requerido' });
    }
    try{
        const result = await pool.query(
        'UPDATE usuarios SET correo = $1 WHERE id = $2 RETURNING id, nombre, correo',
        [correo, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado id ' + id });
        }
        res.json({ message: 'Correo actualizado exitosamente', usuario: result.rows[0] });
    }catch (error) {
        if (error.code === '23505') { // Código de error para violación de clave única
            res.status(409).json({ error: 'El correo ya está registrado' });
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;