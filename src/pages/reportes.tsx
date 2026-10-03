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

function ModalReporte({
  titulo,
  filtro,
  setFiltro,
  onCerrar,
  onExportar,
  mensaje,
}: {
  titulo: string;
  filtro: string;
  setFiltro: (valor: string) => void;
  onCerrar: () => void;
  onExportar: () => void;
  mensaje: string;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80">
        <h3 className="font-bold text-lg mb-4">{titulo}</h3>
        <label htmlFor="filtroNombre" className="block mb-1">
          Nombre:
        </label>
        <input
          type="text"
          id="filtroNombre"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="border w-full px-2 py-1 rounded mb-2"
        />
        {mensaje && <p className="text-red-600 mb-2">{mensaje}</p>}
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={onCerrar}
            className="bg-gray-200 hover:bg-gray-300 font-bold py-2 px-4 rounded"
          >
            Cerrar
          </button>
          <button
            onClick={onExportar}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Exportar a PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function Reportes() {
  const [mostrarCategorias, setMostrarCategorias] = useState(false);
  const [filtroCategorias, setFiltroCategorias] = useState("");
  const [mensajeCategorias, setMensajeCategorias] = useState("");

  const [mostrarClientes, setMostrarClientes] = useState(false);
  const [filtroClientes, setFiltroClientes] = useState("");
  const [mensajeClientes, setMensajeClientes] = useState("");

  const [mostrarProductos, setMostrarProductos] = useState(false);
  const [filtroProductos, setFiltroProductos] = useState("");
  const [mensajeProductos, setMensajeProductos] = useState("");

  const exportarReporteCategorias = async () => {
    try {
      const respuesta = await listarCategoriasActivas(filtroCategorias);
      const doc = new jsPDF();
      doc.text("Reporte de Categorías", 14, 15);
      autoTable(doc, {
        head: [["Nombre", "Descripción"]],
        body: respuesta.data.map((c: Categoria) => [c.nombre, c.descripcion]),
        startY: 20,
      });
      doc.save("reporte-categorias.pdf");
      setMostrarCategorias(false);
    } catch (error) {
      setMensajeCategorias(obtenerMensajeError(error));
      console.error("Error al generar el reporte de categorías", error);
    }
  };

  const exportarReporteClientes = async () => {
    try {
      const respuesta = await mostrarClientesActivosFiltroNombre(filtroClientes);
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
      setMostrarClientes(false);
    } catch (error) {
      setMensajeClientes(obtenerMensajeError(error));
      console.error("Error al generar el reporte de clientes", error);
    }
  };

  const exportarReporteProductos = async () => {
    try {
      const respuesta = await mostrarProductosActivosFiltro(filtroProductos);
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
      setMostrarProductos(false);
    } catch (error) {
      setMensajeProductos(obtenerMensajeError(error));
      console.error("Error al generar el reporte de productos", error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Reportes</h2>
      <div className="flex gap-4">
        <button
          onClick={() => {
            setFiltroCategorias("");
            setMensajeCategorias("");
            setMostrarCategorias(true);
          }}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        >
          Reporte de Categorías
        </button>
        <button
          onClick={() => {
            setFiltroClientes("");
            setMensajeClientes("");
            setMostrarClientes(true);
          }}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        >
          Reporte de Clientes
        </button>
        <button
          onClick={() => {
            setFiltroProductos("");
            setMensajeProductos("");
            setMostrarProductos(true);
          }}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        >
          Reporte de Productos
        </button>
      </div>

      {mostrarCategorias && (
        <ModalReporte
          titulo="Reporte de categorías"
          filtro={filtroCategorias}
          setFiltro={setFiltroCategorias}
          onCerrar={() => setMostrarCategorias(false)}
          onExportar={exportarReporteCategorias}
          mensaje={mensajeCategorias}
        />
      )}

      {mostrarClientes && (
        <ModalReporte
          titulo="Reporte de clientes"
          filtro={filtroClientes}
          setFiltro={setFiltroClientes}
          onCerrar={() => setMostrarClientes(false)}
          onExportar={exportarReporteClientes}
          mensaje={mensajeClientes}
        />
      )}

      {mostrarProductos && (
        <ModalReporte
          titulo="Reporte de productos"
          filtro={filtroProductos}
          setFiltro={setFiltroProductos}
          onCerrar={() => setMostrarProductos(false)}
          onExportar={exportarReporteProductos}
          mensaje={mensajeProductos}
        />
      )}
    </div>
  );
}
export default Reportes;