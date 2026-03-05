import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">This page could not be found.</h1>
        <p className="text-gray-600 mb-6">请访问首页或交易页</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-4 py-2 rounded-md bg-[#416df9] text-white hover:opacity-90"
          >
            首页（将跳转到交易页）
          </Link>
          <Link
            href="/trade"
            className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
          >
            交易页 /trade
          </Link>
        </div>
      </div>
    </main>
  );
}
