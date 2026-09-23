import { createFileRoute } from "@tanstack/react-router";
import { Wizard } from "@/components/wizard";
import { noindexHead } from "@/lib/seo";

export const Route = createFileRoute("/post/$id")({
  head: () => noindexHead("Edit listing"),
  component: function EditPost() {
    const { id } = Route.useParams();
    const numeric = Number(id);
    return <Wizard listingId={Number.isInteger(numeric) ? numeric : undefined} />;
  },
});
