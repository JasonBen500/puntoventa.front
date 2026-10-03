import { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { listarCategoriasActivas } from "../services/categoriaServices";
import { mostrarClientesActivosFiltroNombre } from "../services/clienteServices";
import { mostrarProductosActivosFiltro } from "../services/productoServices";
import type { Categoria } from "../types/categoria";
import type { Cliente } from "../types/cliente";
import type { Producto } from "../types/Producto";

const obtenerMensajeError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.mensaje ?? error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Ocurrió un error inesperado";
};

function ReporteCategorias() {
  const [filtro, setFiltro] = useState("");
  const [mensaje, setMensaje] = useState("");

  const exportar = async () => {
    try {
      const respuesta = await listarCategoriasActivas(filtro);
      const doc = new jsPDF();
      doc.text("Reporte de Categorías", 14, 15);
      autoTable(doc, {
        head: [["Nombre", "Descripción"]],
        body: respuesta.data.map((c: Categoria) => [c.nombre, c.descripcion]),
        startY: 20,
      });
      doc.save("reporte-categorias.pdf");
      setMensaje("");
    } catch (error) {
      setMensaje(obtenerMensajeError(error));
      console.error("Error al generar el reporte de categorías", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-bold text-lg mb-4">Reporte de Categorías</h3>
      <label htmlFor="filtroCategorias" className="block mb-1">
        Nombre:
      </label>
      <input
        type="text"
        id="filtroCategorias"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="border w-full px-2 py-1 rounded mb-4"
      />
      {mensaje && <p className="text-red-600 mb-2">{mensaje}</p>}
      <button
        onClick={exportar}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Exportar a PDF
      </button>
    </div>
  );
}

function ReporteClientes() {
  const [filtro, setFiltro] = useState("");
  const [mensaje, setMensaje] = useState("");

  const exportar = async () => {
    try {
      const respuesta = await mostrarClientesActivosFiltroNombre(filtro);
      const doc = new jsPDF();
      doc.text("Reporte de Clientes", 14, 15);
      autoTable(doc, {
        head: [["Nombre", "Apellido", "Email", "Teléfono"]],
        body: respuesta.data.map((c: Cliente) => [
          c.nombre,
          c.apellido,
          c.email,
          c.telefono,
        ]),
        startY: 20,
      });
      doc.save("reporte-clientes.pdf");
      setMensaje("");
    } catch (error) {
      setMensaje(obtenerMensajeError(error));
      console.error("Error al generar el reporte de clientes", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-bold text-lg mb-4">Reporte de Clientes</h3>
      <label htmlFor="filtroClientes" className="block mb-1">
        Nombre:
      </label>
      <input
        type="text"
        id="filtroClientes"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="border w-full px-2 py-1 rounded mb-4"
      />
      {mensaje && <p className="text-red-600 mb-2">{mensaje}</p>}
      <button
        onClick={exportar}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Exportar a PDF
      </button>
    </div>
  );
}

function ReporteProductos() {
  const [filtro, setFiltro] = useState("");
  const [mensaje, setMensaje] = useState("");

  const exportar = async () => {
    try {
      const respuesta = await mostrarProductosActivosFiltro(filtro);
      const doc = new jsPDF();
      doc.text("Reporte de Productos", 14, 15);
      autoTable(doc, {
        head: [["Nombre", "Precio", "Stock"]],
        body: respuesta.data.map((p: Producto) => [
          p.nombre,
          p.precio.toFixed(2),
          String(p.stock),
        ]),
        startY: 20,
      });
      doc.save("reporte-productos.pdf");
      setMensaje("");
    } catch (error) {
      setMensaje(obtenerMensajeError(error));
      console.error("Error al generar el reporte de productos", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-bold text-lg mb-4">Reporte de Productos</h3>
      <label htmlFor="filtroProductos" className="block mb-1">
        Nombre:
      </label>
      <input
        type="text"
        id="filtroProductos"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="border w-full px-2 py-1 rounded mb-4"
      />
      {mensaje && <p className="text-red-600 mb-2">{mensaje}</p>}
      <button
        onClick={exportar}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Exportar a PDF
      </button>
    </div>
  );
}

function Reportes() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Reportes</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReporteCategorias />
        <ReporteClientes />
        <ReporteProductos />
      </div>
    </div>
  );
}
export default Reportes;
