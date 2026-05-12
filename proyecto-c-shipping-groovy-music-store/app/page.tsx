import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      {/* Tarjeta principal */}
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-200">
        
        {/* Ícono o Emoji decorativo */}
        <div className="text-6xl mb-4">📦</div>

        {/* Título principal */}
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2 tracking-tight">
          Shipping App
        </h1>
        
        {/* Subtítulo / Descripción */}
        <p className="text-gray-500 mb-8">
          Panel de gestión logística para el Marketplace de Vinilos.
        </p>

        {/* Botón con estilos de Tailwind */}
        <Link 
          href="/empresas"
          className="inline-block w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow hover:bg-blue-700 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
        >
          Gestionar Empresas
        </Link>
        
      </div>
    </main>
  );
}