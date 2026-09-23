import type { ReactNode } from "react";
import { Link, useRouteContext } from "@tanstack/react-router";
import { Prose } from "@/components/prose";

export function Policy({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  const custom = body.trim();
  return (
    <Prose title={title}>
      {custom
        ? custom.split(/\n{2,}/).map((paragraph) => (
          <p key={paragraph.slice(0, 48)} className="whitespace-pre-wrap">{paragraph}</p>
        ))
        : children}
    </Prose>
  );
}

export function PrivacyBody() {
  const { site } = useRouteContext({ from: "__root__" });
  return (
    <>
      <p>This draft explains how {site.name} handles information on this website. It is written for a UAE marketplace and should be reviewed by a UAE-qualified lawyer before launch. It is not legal advice and it is not a government document.</p>
      <h2>Who this applies to</h2>
      <p>{site.legalName} operates the marketplace. Advertisers and customers are separate from the platform. Contact {site.email} about privacy requests.</p>
      <h2>Account information</h2>
      <p>If you create an account we store your name, email address, and the sign-in method you used. Email and password accounts store a credential with our authentication provider. Google sign-in, where enabled, shares the basic profile that provider returns. We do not offer phone-number login.</p>
      <h2>Advertiser information</h2>
      <p>A listing can include a company name, salesperson name, phone number, WhatsApp number, area, description, and photos. Phone and WhatsApp are shown so customers can contact the advertiser directly. Sign-in email addresses are not published on the listing.</p>
      <h2>Listing content and photos</h2>
      <p>Photos and descriptions are stored so the listing can be shown, reviewed, and edited. You should only upload images you have the right to use.</p>
      <h2>Saved cars and activity</h2>
      <p>Signed-in users can save listings. We record simple events such as a listing view or a tap on WhatsApp or call, so advertisers can see activity counts. That record is not a copy of the WhatsApp conversation.</p>
      <h2>Device and browser data</h2>
      <p>The host and our authentication service receive standard technical data such as IP address, browser type, and cookies needed to keep a session. We do not sell browsing data.</p>
      <h2>Cookies</h2>
      <p>Essential cookies keep you signed in. A preference stored in your browser remembers the cookie note. Advertising cookies are not used. See the cookie policy before any analytics cookies are added later.</p>
      <h2>Service providers</h2>
      <p>Hosting, database, and sign-in providers process data so the site can run. The exact vendors are configured at deployment and should be listed here before launch. Do not assume a provider is used unless it is named in the live policy.</p>
      <h2>How long we keep information</h2>
      <p>Listings stay until the advertiser deletes them or an admin removes them. Deleted listings are taken off public search. Account, report, and contact messages are kept while needed to operate the marketplace, handle abuse, and meet legal duties. Sample listings shipped with a preview are fictional.</p>
      <h2>Your requests</h2>
      <p>You can edit your profile and listings from your account. To ask for a copy of your account data, a correction, or account deletion, email {site.email}. We may need to confirm it is your account. Some records may be kept where required for security, disputes, or law.</p>
      <h2>Reports and safety</h2>
      <p>If you report a listing we store the reason, any details, and the listing it refers to. Admins use that queue to moderate the marketplace.</p>
      <h2>Contact forms</h2>
      <p>If you write through the contact page we store your name, email, subject and message so the marketplace team can read it. That address is {site.email}. Do not send identity documents or payment details through the form.</p>
      <h2>Security</h2>
      <p>Access to accounts and admin tools is limited to signed-in users. No method of storage is perfect. Tell us if you think an account has been used without permission.</p>
      <h2>Children</h2>
      <p>The marketplace is not directed at children. Do not create an account if you are under the age required to contract in your location. If you believe a child has given us personal information, email {site.email}.</p>
      <h2>International transfers</h2>
      <p>Hosting and sign-in providers may process information outside the UAE. The vendors actually used should be named here before launch. This draft does not claim a particular transfer mechanism has been approved.</p>
      <h2>Updates</h2>
      <p>If this policy changes, the updated text will be published on this page. Continued use of the site after an update means you are using the site under the published policy.</p>
    </>
  );
}

export function TermsBody() {
  const { site } = useRouteContext({ from: "__root__" });
  return (
    <>
      <p>These terms are a draft for {site.name}, a marketplace website. Have a UAE-qualified lawyer review them before production launch. They are not legal advice and they are not an official approval.</p>
      <h2>The platform is an intermediary</h2>
      <p>{site.legalName} helps people discover cars and contact advertisers. It does not own the vehicles listed by users unless a specific listing clearly says otherwise. It is not the rental company, the dealer, or a party to the rental or sale. Customers and advertisers communicate and contract with each other.</p>
      <h2>Eligibility and accounts</h2>
      <p>You must be able to form a binding agreement in your location to create an account. You are responsible for the activity on your account and for keeping your sign-in details private. Sign-in is by email and password or by a supported provider such as Google.</p>
      <h2>Listing rules</h2>
      <p>Advertisers may post cars for rent or sale. Information must be accurate to the best of their knowledge: price, deposit, mileage, location, photos, and whether delivery is offered. Do not post a vehicle you are not allowed to advertise. New listings are reviewed when manual moderation is on. Material changes to a live listing can be sent back for review.</p>
      <h2>Advertiser responsibilities</h2>
      <p>Rental companies, dealers, businesses, and private sellers are responsible for their own availability, condition, insurance, registration, deposits, refunds, cancellations, pickup, and delivery. They choose what contact details to show. WhatsApp and phone conversations happen off the platform, directly with the customer.</p>
      <h2>Customer responsibilities</h2>
      <p>Check the vehicle, the seller’s authority to rent or sell, insurance, registration, and the written terms before you pay. Do not send money to an account you have not verified. The platform does not hold deposits and does not process the rental or purchase payment.</p>
      <h2>Payments, deposits, and disputes</h2>
      <p>Prices and deposits on a listing are set by the advertiser. Refunds, cancellations, accidents, and disagreements about the car are between the customer and the advertiser. {site.name} can remove a listing or suspend an account that breaks these rules, and it provides a report form, but it does not decide the commercial contract.</p>
      <h2>Prohibited use</h2>
      <ul>
        <li>Stolen vehicles, fake availability, or copied photos you do not control.</li>
        <li>Misleading prices, hidden fees, or impersonating another business.</li>
        <li>Inappropriate content, harassment, or attempts to access someone else’s account.</li>
        <li>Scraping that degrades the service.</li>
      </ul>
      <h2>Intellectual property</h2>
      <p>Advertisers grant the platform a licence to host and display the text and photos they upload, for the purpose of operating the marketplace. The site design and name belong to the operator. Do not copy another advertiser’s photos.</p>
      <h2>Moderation</h2>
      <p>Admins may approve, reject, pause, feature, or remove listings, and may suspend users or businesses. A verified badge means an admin marked a business as checked. It is not a government licence and it does not guarantee every car that business lists.</p>
      <h2>Availability and liability</h2>
      <p>The site is provided as available. Listings can expire, be paused, or be wrong because an advertiser made an error. To the extent the law allows, the platform is not liable for vehicle condition, availability, pricing, deposits, insurance, accidents, ownership, payment, refunds, cancellation, delivery, pickup, or statements made by advertisers. Nothing here limits liability that cannot legally be limited. The governing law and venue should be confirmed by counsel before launch; this draft does not choose a court.</p>
      <h2>Changes</h2>
      <p>We may update these terms by publishing a new version on this page. Contact {site.email} with questions about the marketplace itself, not about a specific car.</p>
      <h2>Direct communication and WhatsApp</h2>
      <p>Customers contact advertisers directly. A WhatsApp or phone button opens the advertiser’s own number. {site.name} does not host that conversation and does not become the rental company by providing the link. Sample listings do not open a live chat.</p>
      <h2>Rental and sale listings</h2>
      <p>Rental listings may show daily, weekly and monthly prices, deposits, mileage and delivery. Sale listings may show a price, mileage and condition. Those figures are the advertiser’s. Confirm them before you pay. Delivery, including airport delivery, applies only when the advertiser selected it.</p>
      <h2>Deposits, payments, cancellations, refunds and insurance</h2>
      <p>{site.name} does not take the deposit, process the rental or purchase, or arrange insurance. Cancellations and refunds follow the advertiser’s terms. The platform can remove a listing. It does not decide the commercial dispute.</p>
      <h2>Vehicle condition, ownership and fraud</h2>
      <p>Advertisers must have authority to offer the vehicle and must not post stolen cars, copied photos, or a price they do not mean. Customers should be wary of unusually low prices and of payment requests that change. Report suspicious listings. A report is not a police call.</p>
      <h2>User conduct, photos and third-party services</h2>
      <p>Do not misuse the site, scrape it in a way that degrades the service, or upload content you do not have the right to use. Sign-in may use an external provider such as Google. Those providers have their own terms. This draft does not claim a government licence, a certification, or a ranking on any search engine.</p>
      <h2>Disputes and contact</h2>
      <p>Disputes about a vehicle stay between the customer and the advertiser. Questions about these terms go to {site.email}. The governing law and venue should be confirmed by UAE counsel before launch. Nothing here excludes liability that cannot legally be excluded.</p>
    </>
  );
}

export function DisclaimerBody() {
  const { site } = useRouteContext({ from: "__root__" });
  return (
    <>
      <p>{site.name} is a marketplace. Customers find cars. Advertisers — rental companies, dealers, automotive businesses, and private sellers — supply the details and handle the rental or sale. The platform is not the seller of those cars unless a listing clearly says so.</p>
      <h2>What the platform does not guarantee</h2>
      <ul>
        <li>That it owns the vehicle.</li>
        <li>That the vehicle, the seller, or the rental is guaranteed.</li>
        <li>That the car is available, accurately described, or in a particular condition.</li>
        <li>That a payment, deposit, refund, or cancellation will be honoured.</li>
        <li>That it is a party to the contract between customer and advertiser.</li>
      </ul>
      <h2>Check before you commit</h2>
      <p>Vehicle details are provided by advertisers. Independently verify condition, who is allowed to rent or sell, insurance, registration, rental terms, deposits, and how you will pay. Inspect the car where it is reasonable to do so. Do not send money until you are satisfied with those checks.</p>
      <h2>Delivery</h2>
      <p>Delivery, including airport delivery, is offered only when the advertiser has said so on the listing. A location on the map does not mean every advertiser delivers there.</p>
      <h2>Verification and samples</h2>
      <p>A verified badge is an admin check of a business profile. It is not automatic and it is not a government verification. Sample listings are labelled and are not real offers. Reports help admins remove listings that break the rules; they are not a police report.</p>
    </>
  );
}

export function CookieBody() {
  const { site } = useRouteContext({ from: "__root__" });
  return (
    <>
      <p>{site.name} uses a small number of cookies and similar storage so the site can function.</p>
      <h2>Essential cookies</h2>
      <p>A session cookie keeps you signed in after you choose email or Google sign-in. Without it, the account, saved cars, and listing tools would ask you to sign in on every page.</p>
      <h2>Preferences</h2>
      <p>Your browser stores a preference when you dismiss the cookie note. That is not used for advertising.</p>
      <h2>What we do not set</h2>
      <p>Advertising and cross-site tracking cookies are not used. If analytics or other optional cookies are added later, this page and the cookie note will be updated first, and the vendor will be named. Placeholders are not a claim that a specific analytics product is installed.</p>
      <h2>Your choice</h2>
      <p>You can block cookies in your browser. Blocking essential cookies will sign you out and may stop posting or saving cars. Browsing public listings does not require an account.</p>
    </>
  );
}

export function SafetyBody() {
  const { site } = useRouteContext({ from: "__root__" });
  return (
    <>
      <p>Use {site.name} to find a car, then deal directly with the advertiser. These are practical steps, not a guarantee.</p>
      <h2>If you are renting or buying</h2>
      <ul>
        <li>Message or call the number on the listing. You are speaking to the advertiser, not to {site.name}.</li>
        <li>Meet in a public place and see the car before you pay a deposit.</li>
        <li>Check that the business name, phone, and payment account match.</li>
        <li>Ask about insurance, excess, mileage, fines, Salik, fuel, and delivery fees.</li>
        <li>For a purchase, ask about accidents, service history, specification, and registration.</li>
        <li>Stop if the price, the car, or the meeting place changes suddenly.</li>
      </ul>
      <h2>If you are advertising</h2>
      <ul>
        <li>Use photos of the actual car and a WhatsApp number you answer.</li>
        <li>State the deposit, mileage allowance, and whether you deliver.</li>
        <li>Do not ask for identity documents through this website.</li>
      </ul>
      <p>If a listing looks wrong, use <Link to="/report-listing">Report a listing</Link>. Reports go to the admin queue. They are not an emergency service and they are not a police report.</p>
    </>
  );
}
