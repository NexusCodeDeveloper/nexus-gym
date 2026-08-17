const TOOLS_BY_ROLE = {
  alumno: [
    'getStudentRoutines',
    'getStudentProgress',
    'getTodayRoutine',
    'getStudentInfo',
    'updateStudentWeight',
    'getRoutineDetail',
  ],
  profesor: [
    'getStudentRoutines',
    'getStudentProgress',
    'getTodayRoutine',
    'getStudentInfo',
    'updateStudentWeight',
    'getRoutineDetail',
    'getTeacherStudents',
    'findStudentByName',
    'createRoutine',
    'addExerciseToRoutine',
    'deleteRoutine',
    'getExerciseLibrary',
  ],
  admin: [
    'getStudentRoutines',
    'getStudentProgress',
    'getTodayRoutine',
    'getStudentInfo',
    'updateStudentWeight',
    'getRoutineDetail',
    'getTeacherStudents',
    'findStudentByName',
    'createRoutine',
    'addExerciseToRoutine',
    'deleteRoutine',
    'getExerciseLibrary',
  ],
  superAdmin: [
    'getStudentRoutines',
    'getStudentProgress',
    'getTodayRoutine',
    'getStudentInfo',
    'updateStudentWeight',
    'getRoutineDetail',
    'getTeacherStudents',
    'findStudentByName',
    'createRoutine',
    'addExerciseToRoutine',
    'deleteRoutine',
    'getExerciseLibrary',
  ],
};

const ALL_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'getStudentRoutines',
      description: 'Obtiene las rutinas completas de un alumno con todos los días y ejercicios',
      parameters: {
        type: 'object',
        properties: {
          studentId: { type: 'string', description: 'ID del alumno en MongoDB' },
        },
        required: ['studentId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getStudentProgress',
      description: 'Obtiene el historial de peso y marcas personales (PRs) de un alumno',
      parameters: {
        type: 'object',
        properties: {
          studentId: { type: 'string', description: 'ID del alumno en MongoDB' },
        },
        required: ['studentId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getTodayRoutine',
      description: 'Obtiene la rutina que el alumno tiene programada para el día de hoy según el día de la semana',
      parameters: {
        type: 'object',
        properties: {
          studentId: { type: 'string', description: 'ID del alumno en MongoDB' },
        },
        required: ['studentId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getTeacherStudents',
      description: 'Obtiene la lista de alumnos de un profesor o administrador',
      parameters: {
        type: 'object',
        properties: {
          teacherId: { type: 'string', description: 'ID del profesor o admin en MongoDB' },
        },
        required: ['teacherId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getStudentInfo',
      description: 'Obtiene información básica de un alumno por su ID',
      parameters: {
        type: 'object',
        properties: {
          studentId: { type: 'string', description: 'ID del alumno en MongoDB' },
        },
        required: ['studentId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'findStudentByName',
      description: 'Busca alumnos por nombre (coincidencia parcial, sin importar mayúsculas)',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Nombre o parte del nombre del alumno' },
          teacherId: { type: 'string', description: 'ID del profesor que tiene a cargo al alumno' },
        },
        required: ['name', 'teacherId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'createRoutine',
      description: 'Crea una rutina de entrenamiento para un alumno con los días especificados',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Título de la rutina (ej: Semana 1 - Push)' },
          studentId: { type: 'string', description: 'ID del alumno en MongoDB' },
          teacherId: { type: 'string', description: 'ID del profesor que crea la rutina' },
          gymId: { type: 'string', description: 'ID del gimnasio (dueño/admin)' },
          level: { type: 'string', description: 'Nivel de la rutina: Principiante, Intermedio, Avanzado', enum: ['Principiante', 'Intermedio', 'Avanzado'] },
          days: {
            type: 'array',
            description: 'Días de la semana que entrena',
            items: {
              type: 'object',
              properties: {
                dayName: { type: 'string', description: 'Nombre del día (Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo)' },
                exercises: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', description: 'Nombre del ejercicio' },
                      series: { type: 'string', description: 'Cantidad de series' },
                      reps: { type: 'string', description: 'Cantidad de repeticiones' },
                      rest: { type: 'string', description: 'Tiempo de descanso (ej: 90 seg)' },
                    },
                  },
                },
              },
              required: ['dayName'],
            },
          },
        },
        required: ['title', 'studentId', 'teacherId', 'gymId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'addExerciseToRoutine',
      description: 'Agrega un ejercicio a un día específico de una rutina existente',
      parameters: {
        type: 'object',
        properties: {
          routineId: { type: 'string', description: 'ID de la rutina en MongoDB' },
          dayName: { type: 'string', description: 'Nombre del día (Lunes, Martes, etc.)' },
          name: { type: 'string', description: 'Nombre del ejercicio' },
          series: { type: 'string', description: 'Cantidad de series' },
          reps: { type: 'string', description: 'Cantidad de repeticiones' },
          rest: { type: 'string', description: 'Tiempo de descanso' },
        },
        required: ['routineId', 'dayName', 'name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'updateStudentWeight',
      description: 'Registra un nuevo peso corporal para un alumno',
      parameters: {
        type: 'object',
        properties: {
          studentId: { type: 'string', description: 'ID del alumno en MongoDB' },
          weight: { type: 'number', description: 'Nuevo peso en kg' },
        },
        required: ['studentId', 'weight'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getRoutineDetail',
      description: 'Obtiene el detalle completo de una rutina: todos los días, ejercicios con series, reps, descanso y video',
      parameters: {
        type: 'object',
        properties: {
          routineId: { type: 'string', description: 'ID de la rutina en MongoDB' },
        },
        required: ['routineId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getExerciseLibrary',
      description: 'Busca ejercicios en la librería de videos por nombre o categoría',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Término de búsqueda (nombre o categoría)' },
          gymId: { type: 'string', description: 'ID del gimnasio para filtrar' },
        },
        required: ['query'],
      },
    },
  },
    {
    type: 'function',
    function: {
      name: 'deleteRoutine',
      description: 'Elimina una rutina de entrenamiento por su ID. Solo el profesor/admin que la creó puede eliminarla.',
      parameters: {
        type: 'object',
        properties: {
          routineId: { type: 'string', description: 'ID de la rutina en MongoDB' },
          teacherId: { type: 'string', description: 'ID del profesor/admin que solicita la eliminación' },
        },
        required: ['routineId', 'teacherId'],
      },
    },
  },
];

export const filterToolsByRole = (role) => {
  const allowedNames = TOOLS_BY_ROLE[role] || [];
  return ALL_TOOLS.filter(t => allowedNames.includes(t.function.name));
};

export default ALL_TOOLS;
