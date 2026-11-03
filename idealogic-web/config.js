/**
 * ============================================================================
 * IDEALOGIC — CONFIGURACIÓN CENTRAL EDITABLE (config.js)
 * ============================================================================
 * "Tus ideas, fuente para una lógica eficiente"
 *
 * Podés editar cualquier texto, color, enlace o servicio desde este archivo
 * O directamente desde la página web usando el botón "✏️ Modo Edición" (Alt + E).
 */

window.IDEALOGIC_CONFIG = {
  brand: {
    nameWhite: "idea",
    nameBlue: "logic",
    fullName: "idealogic",
    subtitle: "SERVICIO TÉCNICO INFORMÁTICO",
    slogan: "“Tus ideas, fuente para una lógica eficiente”",
    institution: "C.R.E.S.R. • San Lorenzo",
    course: "3ro 'A' BTI — 2026",
    motto: "Programando el Futuro",
    instagramHandle: "idealogicsa",
    instagramHandleAlt: "idealogic_bti",
    instagramUrl: "https://www.instagram.com/idealogicsa?vrfl=MXMzMms4bjhubXI5dg==",
    whatsappNumber: "", // Opcional: ej. "595981000000" (si está vacío, redirige a Instagram DM)
    email: "contacto@idealogic.tech",
    location: "San Lorenzo, Paraguay — C.R.E.S.R."
  },

  theme: {
    primaryBlue: "#0d5bd9",
    electricCyan: "#00b4ff",
    emeraldAccent: "#00d68f",
    deepBg: "#020613",
    glassBlur: 22,
    glassOpacity: 0.11,
    circuitSpeed: 1
  },

  // Escenarios interactivos para el Laboratorio de Arquitectura de Bases de Datos en Vivo
  databaseScenarios: {
    comercio: {
      id: "comercio",
      badge: "Retail & Inventario",
      title: "Sistema de Stock, Ventas & Facturación Inteligente",
      description: "Arquitectura relacional de alta velocidad para comercios y distribuidoras. Control de stock en tiempo real, alertas de reposición automática y trazabilidad total de caja.",
      latencyBefore: "380 ms",
      latencyAfter: "2.4 ms",
      integrity: "99.99%",
      sqlPreview: `SELECT p.codigo, p.nombre, i.stock_actual, i.punto_reposicion,
       SUM(v.cantidad) AS ventas_mes,
       ROUND(SUM(v.subtotal), 2) AS ingresos_generados
FROM productos p
INNER JOIN inventario_sucursal i ON p.id_producto = i.id_producto
LEFT JOIN detalle_ventas v ON p.id_producto = v.id_producto
WHERE i.estado_logico = 'ACTIVO'
  AND v.fecha_operacion >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.codigo, p.nombre, i.stock_actual, i.punto_reposicion
HAVING i.stock_actual <= i.punto_reposicion
ORDER BY ingresos_generados DESC;`,
      tables: [
        {
          name: "PRODUCTOS_CATALOGO",
          type: "Master Table",
          records: "48,200 reg.",
          color: "#00b4ff",
          fields: [
            { key: "PK", name: "id_producto", type: "UUID NOT NULL" },
            { key: "IX", name: "codigo_barra", type: "VARCHAR(32) UNIQUE" },
            { key: "", name: "precio_unitario", type: "DECIMAL(12,2)" },
            { key: "FK", name: "id_proveedor", type: "INT REFERENCES prov" }
          ]
        },
        {
          name: "TRANSACCIONES_VENTA",
          type: "Core Engine",
          records: "312,940 reg.",
          color: "#0d5bd9",
          fields: [
            { key: "PK", name: "id_transaccion", type: "BIGSERIAL" },
            { key: "FK", name: "id_cliente", type: "UUID NOT NULL" },
            { key: "IX", name: "fecha_hora", type: "TIMESTAMPTZ" },
            { key: "", name: "hash_seguridad", type: "CHAR(64) ENCRYPTED" }
          ]
        },
        {
          name: "INVENTARIO_TIEMPO_REAL",
          type: "Live Trigger",
          records: "Sincronizado",
          color: "#00d68f",
          fields: [
            { key: "PK", name: "id_nodo_stock", type: "SERIAL" },
            { key: "FK", name: "id_producto", type: "UUID" },
            { key: "", name: "stock_disponible", type: "INTEGER CHECK >= 0" },
            { key: "TR", name: "alerta_automatica", type: "BOOLEAN DEFAULT TRUE" }
          ]
        },
        {
          name: "AUDITORIA_BLINDADA",
          type: "Security Vault",
          records: "Inmutable",
          color: "#38bdf8",
          fields: [
            { key: "PK", name: "id_log", type: "BIGINT" },
            { key: "", name: "usuario_operador", type: "VARCHAR(60)" },
            { key: "", name: "accion_ejecutada", type: "JSONB" },
            { key: "", name: "backup_snapshot", type: "VERIFIED_SHA256" }
          ]
        }
      ]
    },

    clinica: {
      id: "clinica",
      badge: "Salud & Gestión Médica",
      title: "Base de Datos de Pacientes, Turnos e Historial Encriptado",
      description: "Diseñada con máxima privacidad, acceso instantáneo a fichas clínicas, agenda inteligente sin superposiciones y copias de seguridad automáticas blindadas.",
      latencyBefore: "520 ms",
      latencyAfter: "1.9 ms",
      integrity: "100%",
      sqlPreview: `SELECT pac.id_paciente, pac.nombre_completo,
       esp.nombre_especialidad, tur.fecha_turno, tur.estado_atencion,
       pgp_sym_decrypt(hc.diagnostico_cifrado, :clave_medica) AS historial
FROM pacientes pac
JOIN turnos_medicos tur ON pac.id_paciente = tur.id_paciente
JOIN historial_clinico hc ON pac.id_paciente = hc.id_paciente
JOIN especialidades esp ON tur.id_especialidad = esp.id_especialidad
WHERE tur.fecha_turno = CURRENT_DATE
  AND tur.estado_atencion IN ('CONFIRMADO', 'EN_SALA')
ORDER BY tur.hora_programada ASC;`,
      tables: [
        {
          name: "PACIENTES_REGISTRO",
          type: "Encrypted Core",
          records: "25,400 reg.",
          color: "#00b4ff",
          fields: [
            { key: "PK", name: "id_paciente", type: "UUID NOT NULL" },
            { key: "IX", name: "documento_ci", type: "VARCHAR(20) UNIQUE" },
            { key: "", name: "grupo_sanguineo", type: "CHAR(3)" },
            { key: "", name: "nivel_privacidad", type: "ROLE_STRICT" }
          ]
        },
        {
          name: "AGENDA_TURNOS",
          type: "Zero-Conflict",
          records: "89,120 reg.",
          color: "#0d5bd9",
          fields: [
            { key: "PK", name: "id_turno", type: "BIGSERIAL" },
            { key: "FK", name: "id_profesional", type: "UUID" },
            { key: "IX", name: "bloque_horario", type: "TSRANGE EXCLUDE" },
            { key: "", name: "recordatorio_auto", type: "STATUS_SENT" }
          ]
        },
        {
          name: "HISTORIAL_CLINICO",
          type: "AES-256 Vault",
          records: "Protegido",
          color: "#00d68f",
          fields: [
            { key: "PK", name: "id_ficha", type: "UUID" },
            { key: "FK", name: "id_paciente", type: "UUID" },
            { key: "EN", name: "datos_clinicos", type: "BYTEA_AES256" },
            { key: "", name: "firma_digital", type: "HASH_VALIDATED" }
          ]
        },
        {
          name: "BACKUP_NUBE_SYNC",
          type: "Redundancy",
          records: "Cada 5 min",
          color: "#38bdf8",
          fields: [
            { key: "PK", name: "id_replica", type: "SERIAL" },
            { key: "", name: "nodo_destino", type: "CLOUD_MIRROR_01" },
            { key: "", name: "latencia_sync", type: "1.9 MS" },
            { key: "", name: "integridad", type: "CHECKSUM_OK" }
          ]
        }
      ]
    },

    academico: {
      id: "academico",
      badge: "Educación & Instituciones",
      title: "Plataforma Académica, Matriculación & Seguimiento Técnico",
      description: "Inspirada en la excelencia del Bachillerato Técnico en Informática (BTI): gestión de alumnos, calificaciones en tiempo real, laboratorios y reportes automatizados.",
      latencyBefore: "410 ms",
      latencyAfter: "2.1 ms",
      integrity: "99.99%",
      sqlPreview: `SELECT a.matricula, a.apellido_nombre, c.curso_seccion,
       ROUND(AVG(cal.puntaje_logrado), 2) AS promedio_tecnico,
       COUNT(CASE WHEN asis.presente = TRUE THEN 1 END) AS asistencias
FROM alumnos a
JOIN matriculas m ON a.id_alumno = m.id_alumno
JOIN cursos c ON m.id_curso = c.id_curso
JOIN calificaciones_bti cal ON m.id_matricula = cal.id_matricula
LEFT JOIN registro_asistencia asis ON m.id_matricula = asis.id_matricula
WHERE c.codigo_especialidad = 'BTI-3A' AND m.anio_lectivo = 2026
GROUP BY a.matricula, a.apellido_nombre, c.curso_seccion
ORDER BY promedio_tecnico DESC;`,
      tables: [
        {
          name: "ALUMNOS_MATRICULA",
          type: "Academic Core",
          records: "14,800 reg.",
          color: "#00b4ff",
          fields: [
            { key: "PK", name: "id_alumno", type: "UUID" },
            { key: "IX", name: "nro_matricula", type: "VARCHAR(16) UNIQUE" },
            { key: "FK", name: "id_especialidad", type: "BTI_INFORMATICA" },
            { key: "", name: "estado_academico", type: "REGULAR_ACTIVO" }
          ]
        },
        {
          name: "EVALUACIONES_PROYECTOS",
          type: "Analytics",
          records: "64,500 reg.",
          color: "#0d5bd9",
          fields: [
            { key: "PK", name: "id_evaluacion", type: "BIGSERIAL" },
            { key: "FK", name: "id_materia", type: "INT" },
            { key: "", name: "nota_final", type: "NUMERIC(4,2)" },
            { key: "", name: "observacion_docente", type: "TEXT" }
          ]
        },
        {
          name: "LABORATORIO_EQUIPOS",
          type: "IT Support",
          records: "Monitoreado",
          color: "#00d68f",
          fields: [
            { key: "PK", name: "id_estacion", type: "SERIAL" },
            { key: "", name: "estado_hardware", type: "OPTIMIZADO_100%" },
            { key: "", name: "ultimo_mantenimiento", type: "CURRENT_DATE" },
            { key: "FK", name: "tecnico_asignado", type: "IDEALOGIC_TEAM" }
          ]
        },
        {
          name: "CERTIFICADOS_DIGITALES",
          type: "Verification",
          records: "Verificable",
          color: "#38bdf8",
          fields: [
            { key: "PK", name: "id_certificado", type: "UUID" },
            { key: "IX", name: "codigo_qr_hash", type: "SHA256_PUBLIC" },
            { key: "", name: "institucion", type: "C.R.E.S.R. 2026" },
            { key: "", name: "validez", type: "VERIFIED_TRUE" }
          ]
        }
      ]
    },

    empresarial: {
      id: "empresarial",
      badge: "PyMEs & Corporativo",
      title: "ERP A Medida: Clientes, Finanzas, RRHH & Automatización",
      description: "Unificá todos los sectores de tu empresa en una sola fuente de verdad. Reportes gerenciales al instante, control de costos y soporte técnico integral.",
      latencyBefore: "610 ms",
      latencyAfter: "3.1 ms",
      integrity: "99.99%",
      sqlPreview: `WITH flujo_mensual AS (
  SELECT area_negocio,
         SUM(ingreso_neto) AS total_ingresos,
         SUM(costo_operativo) AS total_costos
  FROM contabilidad_central
  WHERE periodo_fiscal = '2026-Q4'
  GROUP BY area_negocio
)
SELECT area_negocio, total_ingresos, total_costos,
       (total_ingresos - total_costos) AS rentabilidad_neta,
       ROUND(((total_ingresos - total_costos) / NULLIF(total_ingresos,0)) * 100, 1) AS margen_pct
FROM flujo_mensual
ORDER BY rentabilidad_neta DESC;`,
      tables: [
        {
          name: "CLIENTES_CRM_360",
          type: "Business Hub",
          records: "52,000 reg.",
          color: "#00b4ff",
          fields: [
            { key: "PK", name: "id_cliente_corp", type: "UUID" },
            { key: "IX", name: "ruc_identificador", type: "VARCHAR(24)" },
            { key: "", name: "linea_credito", type: "NUMERIC(14,2)" },
            { key: "", name: "ejecutivo_cuenta", type: "VARCHAR(80)" }
          ]
        },
        {
          name: "FINANZAS_FLUJO_CAJA",
          type: "Real-Time Ledger",
          records: "420,100 reg.",
          color: "#0d5bd9",
          fields: [
            { key: "PK", name: "id_asiento", type: "BIGSERIAL" },
            { key: "IX", name: "centro_costo", type: "VARCHAR(40)" },
            { key: "", name: "monto_operacion", type: "DECIMAL(15,2)" },
            { key: "", name: "conciliado_banco", type: "BOOLEAN" }
          ]
        },
        {
          name: "USUARIOS_ROLES_IAM",
          type: "Access Control",
          records: "Zero-Trust",
          color: "#00d68f",
          fields: [
            { key: "PK", name: "id_usuario", type: "UUID" },
            { key: "", name: "rol_jerarquico", type: "ADMIN | OPERADOR" },
            { key: "", name: "autenticacion_2fa", type: "ENABLED" },
            { key: "", name: "sesion_activa", type: "TOKEN_JWT" }
          ]
        },
        {
          name: "MONITOREO_SERVIDORES",
          type: "24/7 Watchdog",
          records: "Online",
          color: "#38bdf8",
          fields: [
            { key: "PK", name: "id_servidor", type: "SERIAL" },
            { key: "", name: "uso_cpu_ram", type: "14% OPTIMAL" },
            { key: "", name: "temperatura_nodo", type: "38°C COOL" },
            { key: "", name: "uptime_anual", type: "99.98% SLA" }
          ]
        }
      ]
    }
  }
};
