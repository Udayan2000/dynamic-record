import TemplateBuilderPage from "../component/Templatebuilder";

export default async function TemplateViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <TemplateBuilderPage templateId={id} />
  );
}
