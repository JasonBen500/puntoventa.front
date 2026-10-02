import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import axios from "axios";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";

import {
  listarCategoriasActivas,
  crearCategoria,
  actualizarCategoria,
  anularCategoria,
} from "../services/categoriaServices";
import type { Categoria } from "../types/categoria";

const formInicial: Categoria = {
  idCategoria: null,
  nombre: "",
  descripcion: "",
};

function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState<Categoria>(formInicial);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const cargarCategorias = async () => {
    try {
      const respuesta = await listarCategoriasActivas();
      setCategorias(respuesta.data);
    } catch (error) {
      console.error("Error al listar categorías", error);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (modoEdicion && form.idCategoria !== null) {
        await actualizarCategoria(form.idCategoria, form);
        setMensaje("Categoría actualizada correctamente");
      } else {
        await crearCategoria(form);
        setMensaje("Categoría creada correctamente");
      }
      setForm(formInicial);
      setModoEdicion(false);
      cargarCategorias();
    } catch (error) {
      setMensaje(obtenerMensajeError(error));
      console.error("Error al guardar categoría", error);
    }
  };

  const handleModificar = (categoria: Categoria) => {
    setForm(categoria);
    setModoEdicion(true);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();

    // 1. Título del reporte
    doc.text("Listado de Categorías", 14, 15);

    // 2. Preparar los datos de la tabla
    const columnas = ["Nombre", "Direccion"];
    const filas = categorias.map((categoria) => [
      categoria.nombre,
      categoria.descripcion,
    ]);

    // 3. Dibujar la tabla
    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 20, // para que no choque con el título
    });

    // 4. Descargar
    doc.save("categorias.pdf");
  };

  const exportarExcel = async () => {
    // 1. Crear el libro y la hoja
    const libro = new ExcelJS.Workbook();
    const hoja = libro.addWorksheet("Categorías");

    // 2. Título y fecha
    hoja.addRow(["Listado de Categorías"]).font = { size: 16, bold: true };
    hoja.addRow(["Fecha: " + new Date().toLocaleDateString()]);
    hoja.addRow([]); // fila vacía de separación

    // 3. Encabezados de la tabla (mismos colores que el PDF)
    const encabezado = hoja.addRow(["Nombre", "Descripción"]);
    encabezado.eachCell((celda) => {
      celda.font = { bold: true, color: { argb: "FFFFFFFF" } };
      celda.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF166534" },
      };
      celda.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // 4. Filas de datos
    categorias.forEach((categoria, indice) => {
      const fila = hoja.addRow([categoria.nombre, categoria.descripcion]);
      fila.eachCell((celda) => {
        celda.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        // filas alternadas en verde claro, como en el PDF
        if (indice % 2 === 1) {
          celda.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFDCFCE7" },
          };
        }
      });
    });

    // 5. Ancho de columnas
    hoja.getColumn(1).width = 30;
    hoja.getColumn(2).width = 60;

    // 6. Generar el archivo y descargarlo
    const buffer = await libro.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "categorias.xlsx";
    enlace.click();
    URL.revokeObjectURL(url);
  };

  const handleAnular = async (idCategoria: number) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas anular esta categoría?",
    );
    if (!confirmar) return;
    try {
      await anularCategoria(idCategoria);
      setMensaje("Categoría anulada correctamente");
      cargarCategorias();
    } catch (error) {
      setMensaje(obtenerMensajeError(error));
      console.error("Error al anular la categoría", error);
    }
  };

  const obtenerMensajeError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.mensaje ?? error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return "Ocurrió un error inesperado";
  };

  return (
    <div>
      <h2>Ingresar/Modificar Categorías</h2>
      {mensaje && <p>{mensaje}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nombre">Nombre:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="descripcion">Descripción:</label>
          <input
            type="text"
            id="descripcion"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Guardar</button>
      </form>
      <h2>Listado de Categorías</h2>
      <button
        onClick={exportarPDF}
        className="bg-green-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded mb-4"
      ></button>
      <button
        onClick={exportarExcel}
        className="bg-green-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded mb-4"
      ></button>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Modificar</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((categoria) => (
            <tr key={categoria.idCategoria}>
              <td>{categoria.nombre}</td>
              <td>{categoria.descripcion}</td>
              <td>
                <button onClick={() => handleModificar(categoria)}>
                  Modificar
                </button>
              </td>
              <td>
                <button
                  onClick={() =>
                    categoria.idCategoria !== null &&
                    handleAnular(categoria.idCategoria)
                  }
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default Categorias;
