import { redirect } from 'next/navigation';

export default function Home() {
  redirect(`/trade`);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-[500px] p-4 -mt-36">
        <div className="pb-24"></div>
      </div>
    </main>
  );
}
