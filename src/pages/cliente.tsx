import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import axios from "axios";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";

import {
  listarClientesActivos,
  crearCliente,
  actualizarCliente,
  anularCliente,
} from "../services/clienteServices";
import type { Cliente } from "../types/cliente";

const formInicial: Cliente = {
  idCliente: null,
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
};

function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState<Cliente>(formInicial);
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

  const cargarClientes = async () => {
    try {
      const respuesta = await listarClientesActivos();
      setClientes(respuesta.data);
    } catch (error) {
      setMensaje(obtenerMensajeError(error));
      console.error("Error al listar clientes", error);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (modoEdicion && form.idCliente !== null) {
        await actualizarCliente(form.idCliente, form);
        setMensaje("Cliente actualizado correctamente");
      } else {
        await crearCliente(form);
        setMensaje("Cliente creado correctamente");
      }
      setForm(formInicial);
      setModoEdicion(false);
      cargarClientes();
    } catch (error) {
      setMensaje(obtenerMensajeError(error));
      console.error("Error al guardar cliente", error);
    }
  };

  const handleModificar = (cliente: Cliente) => {
    setForm({ ...cliente });
    setModoEdicion(true);
  };

  const cancelarEdicion = () => {
    setForm(formInicial);
    setModoEdicion(false);
  };

  const generarPDF = () => {
    const doc = new jsPDF();

    doc.text("Listado de Clientes", 14, 15);

    const columnas = ["Nombre", "Apellido", "Email", "Teléfono"];
    const filas = clientes.map((cliente) => [
      cliente.nombre,
      cliente.apellido,
      cliente.email,
      cliente.telefono,
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
    doc.save("clientes.pdf");
  };

  const verPDF = () => {
    const doc = generarPDF();
    const blobUrl = doc.output("bloburl");
    window.open(blobUrl, "_blank");
  };

  const exportarExcel = async () => {
    const libro = new ExcelJS.Workbook();
    const hoja = libro.addWorksheet("Clientes");

    hoja.addRow(["Listado de Clientes"]).font = { size: 16, bold: true };
    hoja.addRow(["Fecha: " + new Date().toLocaleDateString()]);
    hoja.addRow([]);

    const encabezado = hoja.addRow(["Nombre", "Apellido", "Email", "Teléfono"]);
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

    clientes.forEach((cliente, indice) => {
      const fila = hoja.addRow([
        cliente.nombre,
        cliente.apellido,
        cliente.email,
        cliente.telefono,
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

    hoja.getColumn(1).width = 25;
    hoja.getColumn(2).width = 25;
    hoja.getColumn(3).width = 35;
    hoja.getColumn(4).width = 20;

    const buffer = await libro.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "clientes.xlsx";
    enlace.click();
    URL.revokeObjectURL(url);
  };

  const handleAnular = async (idCliente: number) => {
    const confirmar = window.confirm("¿Seguro que deseas anular este cliente?");
    if (!confirmar) return;
    try {
      await anularCliente(idCliente);
      setMensaje("Cliente anulado correctamente");
      cargarClientes();
    } catch (error) {
      setMensaje(obtenerMensajeError(error));
      console.error("Error al anular el cliente", error);
    }
  };

  return (
    <div>
      <h2>{modoEdicion ? "Modificar Cliente" : "Ingresar Cliente"}</h2>
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
            maxLength={100}
            required
          />
        </div>
        <div>
          <label htmlFor="apellido">Apellido:</label>
          <input
            type="text"
            id="apellido"
            name="apellido"
            value={form.apellido}
            onChange={handleChange}
            maxLength={100}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="telefono">Teléfono:</label>
          <input
            type="text"
            id="telefono"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            maxLength={15}
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
      <h2>Listado de Clientes</h2>
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
            <th>Apellido</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Modificar</th>
            <th>Anular</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.idCliente}>
              <td>{cliente.nombre}</td>
              <td>{cliente.apellido}</td>
              <td>{cliente.email}</td>
              <td>{cliente.telefono}</td>
              <td>
                <button onClick={() => handleModificar(cliente)}>
                  Modificar
                </button>
              </td>
              <td>
                <button
                  onClick={() =>
                    cliente.idCliente !== null &&
                    handleAnular(cliente.idCliente)
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
export default Clientes;
