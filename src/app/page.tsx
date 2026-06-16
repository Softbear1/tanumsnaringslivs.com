export const runtime = "edge";
import { getDirectoryData } from "@/lib/fetch";
import Header from "@/components/Header";
import DirectoryClient from "@/components/DirectoryClient";
import RegisterCTA from "@/components/RegisterCTA";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export default async function Home() {
  const { categories, businesses } = await getDirectoryData();

  return (
    <>
      <Header />
      <main className="flex-1">
        <DirectoryClient
          categories={categories}
          businesses={businesses}
        />
        <RegisterCTA />
      </main>
      <Footer />
      <ChatWidget businesses={businesses} categories={categories} />
    </>
  );
}
