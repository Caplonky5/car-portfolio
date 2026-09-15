export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-gray-900 font-semibold">Shiftautography</p>
            <p className="text-sm text-gray-600 mt-1">
              Automotive Photography Portfolio
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 text-sm text-gray-600">
            <p>
              <a
                href="mailto:shiftautography@gmail.com"
                className="hover:underline"
              >
                shiftautography@gmail.com
              </a>
            </p>
            <p>
              <a
                href="https://www.instagram.com/shiftautography/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                @shiftautography on Instagram
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
