export default function Footer() {
  return (
    <footer className="w-full text-center py-4 text-sm text-gray-500 border-t mt-auto">
      © {new Date().getFullYear()} Poupix — Todos os direitos reservados.
    </footer>
  );
}