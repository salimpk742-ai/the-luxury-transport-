import { createFileRoute } from "@tanstack/react-router";
import { Wizard } from "@/components/wizard";
import { noindexHead } from "@/lib/seo";

export const Route = createFileRoute("/post/")({
  head: () => noindexHead("Post your car"),
  component: () => <Wizard />,
});