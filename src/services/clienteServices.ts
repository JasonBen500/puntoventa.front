import api from "../api/axios";
import type { Cliente } from "../types/Cliente";

export const listarClientesActivos = () =>
  api.get<Cliente[]>("/clientes/mostrarActivos");

export const crearCliente = (data: Omit<Cliente, "idCliente">) =>
  api.post<Cliente>("/clientes", data);

export const actualizarCliente = (
  id: number,
  data: Omit<Cliente, "idCliente">,
) => api.put<Cliente>(`/clientes/${id}`, data);

export const anularCliente = (id: number) =>
  api.put<Cliente>(`/clientes/anular/${id}`);
