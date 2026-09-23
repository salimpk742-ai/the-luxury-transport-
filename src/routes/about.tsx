import { createFileRoute, Link, useRouteContext } from "@tanstack/react-router";
import { Prose } from "@/components/prose";
import { publicHead } from "@/lib/seo";
import { siteFromMatches } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: ({ matches }) => {
    const site = siteFromMatches(matches);
    return publicHead(site, {
      title: `About | ${site.name}`,
      description: `${site.name} is a Dubai automotive marketplace. Customers discover cars for rent and sale from independent advertisers.`,
      path: "/about",
    });
  },
  component: AboutPage,
});

function AboutPage() {
  const { site } = useRouteContext({ from: "__root__" });
  return (
    <Prose title={`About ${site.name}`}>
      <p>
        {site.name} is a Dubai-focused online automotive marketplace. It helps customers discover vehicles available for rental and purchase from independent rental companies, dealers, businesses and private sellers.
      </p>
      <h2>What the platform does</h2>
      <p>
        {site.name} provides the marketplace and the discovery tools: search, listing pages, advertiser profiles, and a way to message the person who posted the car. It does not own or control every vehicle listed here, and it is not itself a rental company unless a specific listing clearly says otherwise.
      </p>
      <h2>Who you are dealing with</h2>
      <p>
        Vehicle owners and advertisers are responsible for their listings. Customers communicate directly with those advertisers, usually on WhatsApp or by phone. Agreements about price, deposit, insurance, delivery and condition are between those two parties. {site.name} does not become a party to the rental or sale merely by publishing the listing.
      </p>
      <h2>What is not guaranteed</h2>
      <p>
        The platform does not guarantee every listing, every price, or every advertiser. A verified badge appears only after an administrator has checked that business. It is not a government licence. Sample cars are labelled and are not real offers.
      </p>
      <p>
        Questions about a car go to the advertiser. Questions about the website go to <Link to="/contact">contact</Link> or {site.email}.
      </p>
    </Prose>
  );
}
