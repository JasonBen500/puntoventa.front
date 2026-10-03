import { Routes, Route } from "react-router-dom";
import Categorias from "./pages/categorias";
import Clientes from "./pages/cliente";
import Productos from "./pages/productos";
import Reportes from "./pages/reportes";
function App() {
  return (
    <Routes>
      <Route path="/categorias" element={<Categorias />} />
      <Route path="/clientes" element={<Clientes />} />
      <Route path="/productos" element={<Productos />} />
      <Route path="/reportes" element={<Reportes />} />
    </Routes>
  );
}
export default App;
