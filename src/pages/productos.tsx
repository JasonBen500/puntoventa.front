import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import axios from "axios";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";

import {
  listarProductosActivos,
  crearProducto,
  actualizarProducto,
  anularProducto,
} from "../services/productoServices";
import { listarCategoriasActivas } from "../services/categoriaServices";
import type { Producto } from "../types/Producto";
import type { Categoria } from "../types/categoria";

const formInicial: Producto = {
  idProducto: null,
  idCategoria: null,
  nombre: "",
  descripcion: "",
  precio: 0,
  stock: 0,
};

function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState<Producto>(formInicial);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const obtenerMensajeError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.mensaje ?? error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return "Ocurrió un error inesperado";
  };

  const nombreCategoria = (idCategoria: number | null): string => {
    const categoria = categorias.find((c) => c.idCategoria === idCategoria);
    return categoria ? categoria.nombre : "—";
  };

  const cargarProductos = async () => {
    try {
      const respuesta = await listarProductosActivos();
      setProductos(respuesta.data);
    } catch (error) {
      setMensaje(obtenerMensajeError(error));
      console.error("Error al listar productos", error);
    }
  };

  const cargarCategorias = async () => {
    try {
      const respuesta = await listarCategoriasActivas();
      setCategorias(respuesta.data);
    } catch (error) {
      console.error("Error al listar categorías", error);
    }
  };

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "precio" || name === "stock" || name === "idCategoria"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (modoEdicion && form.idProducto !== null) {
        await actualizarProducto(form.idProducto, form);
        setMensaje("Producto actualizado correctamente");
      } else {
        await crearProducto(form);
        setMensaje("Producto creado correctamente");
      }
      setForm(formInicial);
      setModoEdicion(false);
      cargarProductos();
    } catch (error) {
      setMensaje(obtenerMensajeError(error));
      console.error("Error al guardar producto", error);
    }
  };

  const handleModificar = (producto: Producto) => {
    setForm({ ...producto });
    setModoEdicion(true);
  };

  const cancelarEdicion = () => {
    setForm(formInicial);
    setModoEdicion(false);
  };

  const generarPDF = () => {
    const doc = new jsPDF();

    doc.text("Listado de Productos", 14, 15);

    const columnas = ["Nombre", "Categoría", "Precio", "Stock"];
    const filas = productos.map((producto) => [
      producto.nombre,
      nombreCategoria(producto.idCategoria),
      producto.precio.toFixed(2),
      String(producto.stock),
    ]);

    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 20,
    });

    return doc;
  };

  const exportarPDF = () => {
    const doc = generarPDF();
    doc.save("productos.pdf");
  };

  const verPDF = () => {
    const doc = generarPDF();
    const blobUrl = doc.output("bloburl");
    window.open(blobUrl, "_blank");
  };

  const exportarExcel = async () => {
    const libro = new ExcelJS.Workbook();
    const hoja = libro.addWorksheet("Productos");

    hoja.addRow(["Listado de Productos"]).font = { size: 16, bold: true };
    hoja.addRow(["Fecha: " + new Date().toLocaleDateString()]);
    hoja.addRow([]);

    const encabezado = hoja.addRow(["Nombre", "Categoría", "Precio", "Stock"]);
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

    productos.forEach((producto, indice) => {
      const fila = hoja.addRow([
        producto.nombre,
        nombreCategoria(producto.idCategoria),
        producto.precio,
        producto.stock,
      ]);
      fila.eachCell((celda) => {
        celda.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        if (indice % 2 === 1) {
          celda.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFDCFCE7" },
          };
        }
      });
    });

    hoja.getColumn(1).width = 30;
    hoja.getColumn(2).width = 25;
    hoja.getColumn(3).width = 15;
    hoja.getColumn(4).width = 10;

    const buffer = await libro.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "productos.xlsx";
    enlace.click();
    URL.revokeObjectURL(url);
  };

  const handleAnular = async (idProducto: number) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas anular este producto?",
    );
    if (!confirmar) return;
    try {
      await anularProducto(idProducto);
      setMensaje("Producto anulado correctamente");
      cargarProductos();
    } catch (error) {
      setMensaje(obtenerMensajeError(error));
      console.error("Error al anular el producto", error);
    }
  };

  return (
    <div>
      <h2>{modoEdicion ? "Modificar Producto" : "Ingresar Producto"}</h2>
      {mensaje && <p>{mensaje}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="idCategoria">Categoría:</label>
          <select
            id="idCategoria"
            name="idCategoria"
            value={form.idCategoria ?? ""}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Selecciona una categoría
            </option>
            {categorias.map((categoria) => (
              <option
                key={categoria.idCategoria}
                value={categoria.idCategoria ?? ""}
              >
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="nombre">Nombre:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
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
        <div>
          <label htmlFor="precio">Precio:</label>
          <input
            type="number"
            id="precio"
            name="precio"
            value={form.precio}
            onChange={handleChange}
            min={0}
            step="0.01"
            required
          />
        </div>
        <div>
          <label htmlFor="stock">Stock:</label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            min={0}
            required
          />
        </div>
        <button type="submit">{modoEdicion ? "Actualizar" : "Guardar"}</button>
        {modoEdicion && (
          <button type="button" onClick={cancelarEdicion}>
            Cancelar
          </button>
        )}
      </form>
      <h2>Listado de Productos</h2>
      <button
        onClick={exportarPDF}
        className="bg-green-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Exportar PDF
      </button>
      <button
        onClick={verPDF}
        className="bg-sky-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Ver PDF
      </button>
      <button
        onClick={exportarExcel}
        className="bg-green-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Exportar Excel
      </button>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Modificar</th>
            <th>Anular</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.idProducto}>
              <td>{producto.nombre}</td>
              <td>{nombreCategoria(producto.idCategoria)}</td>
              <td>{producto.precio}</td>
              <td>{producto.stock}</td>
              <td>
                <button onClick={() => handleModificar(producto)}>
                  Modificar
                </button>
              </td>
              <td>
                <button
                  onClick={() =>
                    producto.idProducto !== null &&
                    handleAnular(producto.idProducto)
                  }
                >
                  Anular
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default Productos;
