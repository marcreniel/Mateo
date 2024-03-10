import Image from "next/image";

export default function Home() {
  return (
    <main className="flex justify-center p-24">
      <div className="bg-white flex flex-col items-center p-8 rounded-lg max-w-md w-full">
        <Image src="/logo.png" alt="Logo" width={250} height={250}/>
      </div>
    </main>
  );
}
