import { notFound } from "next/navigation";
import { generatePreviewForVariation } from "@/lib/actions/cv-builder";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CVPreviewPage({ params }: Props) {
  const { id } = await params;
  const result = await generatePreviewForVariation(id);

  if (result.error || !result.html) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-[210mm] mx-auto bg-white shadow-lg">
        <iframe
          srcDoc={result.html}
          className="w-full h-[297mm] border-0"
          title="CV Preview"
        />
      </div>
    </div>
  );
}
