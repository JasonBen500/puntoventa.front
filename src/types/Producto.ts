export interface Producto {
  idProducto: number | null;
  idCategoria: number | null;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
}
export interface ApiMensaje {
  mensaje: string;
}