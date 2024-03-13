import { pool } from '../db.js';

export const getCoursesWithTopics = async (req, res) => {
    try {
        const [courses] = await pool.query(`
            SELECT 
                Cursos.id AS CursoId,
                Cursos.codigo AS codigo,
                Cursos.nombre AS Curso,
                Cursos.descripcion AS DescripcionCurso,
                Cursos.semestre AS Semestre,
                Cursos.creditos AS Creditos,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', Temas.id,
                        'nombre', Temas.nombre,
                        'descripcion', Temas.descripcion,
                        'curso_id', Temas.curso_id
                    )
                ) AS Temas
            FROM 
                Cursos
            LEFT JOIN 
                Temas ON Cursos.id = Temas.curso_id
            GROUP BY
                Cursos.id
        `);

        // Convertir la cadena de 'Temas' en un arreglo de objetos JSON para cada curso
        const coursesWithTopics = courses.map(course => ({
            ...course,
            Temas: JSON.parse(course.Temas || '[]')
        }));

        res.json(coursesWithTopics);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los cursos y temas');
    }
}

export const updateCourse = async (req, res) => {
    const { id } = req.params;
    const { codigo, nombre, descripcion, semestre, creditos } = req.body;

    try {
        const [result] = await pool.query(`
            UPDATE Cursos
            SET 
                codigo = ?,
                nombre = ?,
                descripcion = ?,
                semestre = ?,
                creditos = ?
            WHERE id = ?
        `, [codigo, nombre, descripcion, semestre, creditos, id]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Curso no encontrado');
        }

        res.send('Curso actualizado con éxito');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar el curso');
    }
}

export const deleteCourse = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query(`
            DELETE FROM Cursos
            WHERE id = ?
        `, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Curso no encontrado');
        }

        res.send('Curso eliminado con éxito');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al eliminar el curso');
    }
}
