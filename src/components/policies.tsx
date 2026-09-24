import type { ReactNode } from "react";
import { Link, useRouteContext } from "@tanstack/react-router";
import { Prose } from "@/components/prose";

export function Policy({ title, body, children }: { title: string; body: string; children: ReactNode }) {
  const custom = body.trim();
  return (
    <Prose title={title} reviewNote={false}>
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
      <p>Last updated: 24 September 2026. This policy explains how {site.legalName} handles personal information on this website. It is written in English so it can be translated later. It describes the live service. It is not a claim that the website has been certified, registered, or approved by the UAE Data Office or any other authority.</p>
      <h2>Who operates the site</h2>
      <p>{site.legalName} operates {site.name}, a Dubai-focused marketplace where independent rental companies, dealers, businesses and private sellers publish vehicle listings. The platform is not the owner, rental company or seller of a third-party vehicle merely because the listing appears here. Privacy requests go to {site.email}.</p>
      <h2>Who this applies to</h2>
      <p>This policy applies to customers, advertisers, and visitors who use the website. Advertisers and customers are separate from the platform. A conversation you start on WhatsApp or by phone is with the advertiser, under that service’s own terms, and is not hosted here.</p>
      <h2>Information we collect</h2>
      <p>Account information. If you create an account we store your name, email address, and the sign-in method you chose. We do not offer phone-number login.</p>
      <p>Email and password. An email/password account stores a protected sign-in credential in our authentication system. We do not keep a readable copy of your password. You are responsible for keeping that password private.</p>
      <p>Google sign-in. If you choose Continue with Google, Google shares the basic profile needed to sign you in: the name, email address, and account identifier that Google returns for the openid, email, and profile scopes. We do not ask Google for your contacts, files, or calendar. Google’s own privacy terms apply to that sign-in.</p>
      <p>Advertiser and listing information. A listing can include the account type, business or seller name, salesperson name, phone number, WhatsApp number, area, prices, deposit, delivery choice, description, and photos. Phone and WhatsApp numbers are shown so customers can contact the advertiser directly. The email address used to sign in is not published on the listing.</p>
      <p>Saved cars and simple activity. Signed-in users can save listings. We can record that a listing was viewed or that someone used the WhatsApp or call button, so activity can be counted. That record is not a copy of the WhatsApp or phone conversation.</p>
      <p>Contact and reports. The contact form stores the name, email, subject, and message you send, so the team can read it. A listing report stores the reason, any details you add, and which listing it refers to. Do not send identity documents, passwords, or payment-card details through either form.</p>
      <p>Technical and security data. The host and the sign-in system receive standard technical data such as IP address, browser type, and the date and time of a request. This is used to run, secure, and debug the site.</p>
      <h2>Cookies and similar storage</h2>
      <p>Essential cookies keep a signed-in session. A preference stored in the browser, not in an advertising cookie, remembers that you dismissed the cookie note. Details are in the <Link to="/cookie-policy">cookie policy</Link>. We do not use advertising cookies, Google Analytics, or a Meta pixel.</p>
      <h2>Why we use the information</h2>
      <p>We use personal information to create and protect accounts, show and moderate listings, let customers contact advertisers, count basic listing activity, answer contact messages, review reports, prevent fraud and abuse, and keep the service secure. We do not sell personal information.</p>
      <p>Where UAE personal-data law requires consent, we rely on the step you take, such as creating an account, posting a listing, sending a message, or submitting a report. Some processing is also needed to provide the service you ask for, to protect the site, or to meet a legal duty. This page does not claim that every activity has been formally classified by the UAE Data Office.</p>
      <h2>Service providers</h2>
      <p>The published website is hosted on Vercel. The application database is hosted on Neon. Google provides Google sign-in. These providers process information so the site can run. They may process it outside the UAE. We have not stated, and do not claim, that a particular cross-border transfer mechanism has been approved. If a provider changes, this page should be updated.</p>
      <h2>Sharing</h2>
      <p>We show listing and advertiser contact details that the advertiser chose to publish. We share information with the providers above so they can host, store, or authenticate. We may disclose information to a competent authority when UAE law requires it, or when needed to investigate a report of fraud, a stolen vehicle, or other unlawful use. We do not give advertisers a copy of your sign-in email through the public listing.</p>
      <h2>How long we keep information</h2>
      <p>A listing stays until the advertiser deletes it or an administrator removes it. A deleted listing is taken off public search. Account, report, contact, and security records are kept while they are needed to operate the marketplace, handle abuse, and meet legal duties. A fixed retention calendar has not been published. That is an operational gap, not a promise to keep data forever or to delete it on a particular day.</p>
      <h2>Security</h2>
      <p>Account and admin tools require a signed-in session. Passwords are stored as protected credentials. No method of storage or transmission is perfect. Email {site.email} if you believe an account has been used without permission.</p>
      <h2>Your requests</h2>
      <p>You can edit your profile and your own listings from your account. You may email {site.email} to ask for a copy of the personal information we hold about your account, a correction of inaccurate information, restriction or deletion, or to withdraw consent where consent was the basis for processing. We may need to confirm that the request is yours. We may keep some records where needed for security, a dispute, or a legal duty. This policy does not invent a regulator complaint number. You may also complain to the competent UAE authority that handles personal-data matters.</p>
      <h2>Children</h2>
      <p>The marketplace is not directed at children. Do not create an account if you do not have the legal capacity to contract. If you believe a child has given us personal information, email {site.email}.</p>
      <h2>Changes</h2>
      <p>If this policy changes, the new text will be published on this page. An Arabic version may be added later on this page. Until then, this English text is the published version.</p>
    </>
  );
}

export function TermsBody() {
  const { site } = useRouteContext({ from: "__root__" });
  return (
    <>
      <p>Last updated: 24 September 2026. These terms govern use of the {site.name} website operated by {site.legalName}. They are in English so an Arabic version can be published later on this page. They are not a government approval, a trade licence, or a statement that every legal duty has been certified.</p>
      <h2>Acceptance and electronic agreement</h2>
      <p>By using the site, creating an account, or publishing a listing, you agree to these terms and to the <Link to="/marketplace-disclaimer">marketplace disclaimer</Link>, <Link to="/privacy-policy">privacy policy</Link>, <Link to="/cookie-policy">cookie policy</Link>, and <Link to="/safety">safety</Link> page. Agreement can be formed electronically. We do not claim to be a licensed trust-service provider, and a click on this website is not described here as a qualified electronic signature.</p>
      <h2>The platform is a marketplace</h2>
      <p>{site.name} helps people discover vehicles and contact the person who advertised them. Third-party rental companies, dealers, businesses and private sellers create the listings. The platform does not generally own, possess, rent, or sell those vehicles. Publishing a listing does not make {site.legalName} a party to the rental or sale. The customer and the advertiser contract with each other. Where UAE law places a duty on the supplier, digital merchant, or provider of a vehicle or service, that duty remains with the person who is actually responsible for it.</p>
      <h2>Eligibility</h2>
      <p>You must have legal capacity to use the site and, if you create an account or advertise, to enter a contract. The site is not directed at children. You must use it in line with the laws that apply to you, including UAE law when you advertise or deal in the UAE.</p>
      <h2>Accounts and sign-in</h2>
      <p>You may register with an email address and password, or with Continue with Google. There is no sign-in with X and no phone-number login. You must give truthful account information and keep it current. You are responsible for activity under your account and for keeping your password and devices private. Tell {site.email} if you believe the account is being misused. We may refuse, suspend, or close an account that breaks these terms or that we reasonably believe is being used unlawfully.</p>
      <h2>Advertiser responsibilities</h2>
      <p>If you advertise, you must have the legal authority to offer the vehicle and you must hold any licence, permit, or permission that UAE or Dubai law requires for the activity you advertise. The platform does not check every advertiser and does not confirm every trade licence. You must describe the vehicle accurately, including the price you actually offer, any deposit, mileage, availability, and whether delivery is offered. You are responsible for the vehicle, the contract, insurance, registration, condition, deposits, refunds, cancellations, fines, Salik, fuel, pickup, and delivery. WhatsApp and phone conversations happen off this website, directly with the customer.</p>
      <h2>Listing requirements</h2>
      <p>Listings may be for rent or for sale. Photos must be of the vehicle you are allowed to show. New listings can be held for review when manual moderation is on. A material edit to a live listing can be returned for review. Sample listings are labelled and are not real offers.</p>
      <h2>Prohibited listings and conduct</h2>
      <ul>
        <li>Stolen vehicles, vehicles you have no authority to advertise, or false claims of ownership.</li>
        <li>Forged documents, counterfeit papers, or fake identities.</li>
        <li>Impersonation of another person, business, or of {site.name}.</li>
        <li>Misleading prices, hidden compulsory fees, or bait listings you do not intend to honour.</li>
        <li>Fraud, scams, phishing, or requests designed to steal passwords, one-time codes, or payment details.</li>
        <li>Illegal vehicles or services, and rental or sale activity that is unlawful where it is carried out.</li>
        <li>Unlawful content, harassment, or unlawful discrimination.</li>
        <li>Malware, hacking, attempts to break into an account or the service, and other conduct prohibited by Federal Decree-Law No. 34 of 2021 on Countering Rumors and Cybercrimes, as amended.</li>
        <li>Scraping or automated access that degrades or circumvents the service, and attempts to evade moderation.</li>
      </ul>
      <h2>Customers</h2>
      <p>You must check the advertiser’s identity and authority, the vehicle, registration, insurance, condition, mileage, accident history where it matters to you, the price, deposits, fees, availability, and the written rental or sale terms before you pay. The platform does not hold deposits and does not process the rental or purchase payment. Do not treat a listing as a guarantee by {site.name}.</p>
      <h2>What is not guaranteed</h2>
      <p>{site.name} does not guarantee that a listing is available, that a vehicle is in a particular condition, that an advertiser will behave lawfully, or that a transaction will be completed. Listings can expire, be paused, be rejected, or contain an advertiser’s mistake.</p>
      <h2>Verification badge</h2>
      <p>A Verified badge means an administrator has marked that business profile. It is not automatic. It is not a government licence, not a guarantee of the business, and not a check of every vehicle that business lists. A badge on a sample profile is only a demonstration.</p>
      <h2>Moderation, reports, suspension</h2>
      <p>We may refuse, edit the display of, pause, or remove a listing, and we may suspend or close an account or business, where these terms are broken or where we reasonably believe a listing is misleading, unsafe, or unlawful. Anyone can <Link to="/report-listing">report a listing</Link>. A report is reviewed in the admin queue. It is not a police report and it is not an emergency service. We may cooperate with a competent authority when the law requires it.</p>
      <h2>Your content</h2>
      <p>You keep ownership of the text and photos you upload. You grant {site.legalName} a non-exclusive licence to host, reproduce, and display that content for operating, moderating, and promoting the marketplace, for as long as the content remains on the service and for a reasonable period afterward for backups, disputes, and legal duties. You must have the right to upload it. The site design and the {site.name} name are not yours to copy. Do not copy another advertiser’s photos.</p>
      <h2>Third-party services</h2>
      <p>Google sign-in, WhatsApp, phone calls, and any payment method an advertiser uses are third-party services. Their terms apply. A link to WhatsApp does not make {site.name} the rental company and does not mean we host that chat.</p>
      <h2>Privacy and cookies</h2>
      <p>Personal information is handled as described in the <Link to="/privacy-policy">privacy policy</Link>. Cookies are described in the <Link to="/cookie-policy">cookie policy</Link>.</p>
      <h2>Liability</h2>
      <p>To the extent UAE law allows, {site.legalName} is not liable for an advertiser’s vehicle, statement, price, deposit, insurance, accident, ownership, payment, refund, cancellation, delivery, or failure to complete a deal. Nothing in these Terms excludes or limits any liability, right or remedy that cannot lawfully be excluded or limited under applicable UAE law. In particular, these terms do not waive a consumer right that Federal Law No. 15 of 2020 on Consumer Protection, as amended by Federal Decree-Law No. 5 of 2023, does not allow to be waived, and they do not remove a duty that remains with the responsible supplier or advertiser.</p>
      <h2>Indemnity</h2>
      <p>If you advertise, you will cover {site.legalName} for reasonable losses and reasonable legal costs arising from your listing, your vehicle transaction, or your breach of these terms, but only to the extent UAE law allows. This indemnity does not require you to give up a right or remedy that cannot lawfully be excluded, and it does not shift a duty that the law places on the platform itself.</p>
      <h2>Governing law and disputes</h2>
      <p>These terms are intended to be governed by the federal laws of the United Arab Emirates and, on matters of local law, the laws of the Emirate of Dubai. Disputes about the website itself, as distinct from a rental or sale contract with an advertiser, are intended to be brought in the courts of Dubai. A dispute about a vehicle stays between the customer and the advertiser. The platform has not published a trade-licence number or a registered office, so the correct forum should be confirmed with a UAE-qualified lawyer before a dispute is filed. Nothing in this section limits a right to complain to a competent authority.</p>
      <h2>Notices, changes, and general terms</h2>
      <p>Notices about these terms can be sent to {site.email}. Questions about a specific car go to the advertiser. We may update these terms by publishing a new version on this page. If a provision cannot be enforced, the rest remains in effect to the extent the law allows. These terms, together with the linked policies, are the published website terms. They do not replace a written rental or sale contract between a customer and an advertiser.</p>
    </>
  );
}

export function DisclaimerBody() {
  const { site } = useRouteContext({ from: "__root__" });
  return (
    <>
      <p>Last updated: 24 September 2026. {site.name} is a marketplace and intermediary. Independent rental companies, dealers, businesses and private sellers create listings for vehicles they offer to rent or sell. {site.legalName} provides the website. It does not generally own, possess, rent, or sell those vehicles, and it does not become a party to a rental or sale merely because the listing is published.</p>
      <h2>Who you contract with</h2>
      <p>Customers contract directly with the advertiser. Price, deposit, insurance, availability, delivery, condition, and cancellation are for that advertiser to state and to perform. {site.name} does not hold the deposit and does not process the rental or purchase payment.</p>
      <h2>Advertiser duties</h2>
      <p>Advertisers are responsible for the legality and accuracy of their listings. They must have authority to advertise the vehicle and any licence or permission that applies to their activity in the UAE or Dubai. The platform does not verify every advertiser.</p>
      <h2>What you should verify yourself</h2>
      <p>A listing is not a guarantee, warranty, endorsement, or government verification by {site.name}. Before you pay or hand over documents, independently check ownership or authority to rent or sell, registration, insurance, condition, mileage, accident history, the real price, deposits, fees, availability, and the written contract.</p>
      <h2>What the platform may do</h2>
      <p>We may reject, remove, pause, or suspend a listing or an account. Users should <Link to="/report-listing">report</Link> a listing that appears suspicious, fraudulent, illegal, or misleading, including possible stolen vehicles, impersonation, or forged documents. We may cooperate with a competent authority when the law requires it. A report on this website is not a police report.</p>
      <h2>Statutory rights</h2>
      <p>Nothing in these Terms excludes or limits any liability, right or remedy that cannot lawfully be excluded or limited under applicable UAE law. Duties that UAE law places on the actual supplier or advertiser remain with that person. This disclaimer is not a government approval and it does not say that {site.name} has no responsibility for the operation of the website itself.</p>
      <p>Read the <Link to="/terms-and-conditions">terms</Link> and the <Link to="/safety">safety</Link> page with this disclaimer.</p>
    </>
  );
}

export function CookieBody() {
  const { site } = useRouteContext({ from: "__root__" });
  return (
    <>
      <p>Last updated: 24 September 2026. This page lists the cookies and similar storage actually used by {site.name}. It does not describe analytics or advertising tools, because those are not installed.</p>
      <h2>Essential session and sign-in cookies</h2>
      <p>After you sign in with email and password or with Google, the site’s own sign-in system stores the session in essential cookies on this website. They are Secure and SameSite Lax. The names currently configured are:</p>
      <ul>
        <li>__Host-grok-auth.session_token, which keeps you signed in.</li>
        <li>__Host-grok-auth.session_data, a short-lived copy of session data so repeat checks are faster.</li>
        <li>__Host-grok-auth.account_data and __Host-grok-auth.dont_remember, which the same sign-in system may set as part of account sign-in.</li>
      </ul>
      <p>These cookies are necessary for the account, saved cars, and listing tools. They are not advertising cookies. Public pages can be read without them.</p>
      <h2>Security</h2>
      <p>The session cookies are also a security control. They let the server recognise a signed-in browser and reject a request that does not belong to that session. We do not add a separate advertising or tracking cookie for this purpose.</p>
      <h2>Preferences</h2>
      <p>When you dismiss the cookie note, the browser stores the key marq-cookie in local storage on this site. That is not a cookie and it is not sent to an advertising network. It only remembers that the note was dismissed.</p>
      <h2>Analytics and advertising</h2>
      <p>Google Analytics, Meta Pixel, and other advertising or analytics cookies are not used. If one is added later, this page will be updated first and the provider will be named.</p>
      <h2>Your choice</h2>
      <p>You can block or delete cookies in your browser. Blocking the essential session cookies will sign you out and can stop you from posting, saving cars, or opening the account. It does not stop you from reading public listings.</p>
    </>
  );
}

export function SafetyBody() {
  const { site } = useRouteContext({ from: "__root__" });
  return (
    <>
      <p>Last updated: 24 September 2026. {site.name} is a marketplace. You deal with the advertiser, not with the platform, when you rent or buy a listed vehicle. These steps reduce risk. They are not a guarantee that a person or a vehicle is safe or lawful.</p>
      <h2>Before you pay or share documents</h2>
      <ul>
        <li>Check the advertiser’s identity and that the business name, phone, and WhatsApp number match the person you are dealing with.</li>
        <li>Ask what authority they have to rent or sell, and ask to see registration and any licence their activity requires.</li>
        <li>Inspect the vehicle yourself, or have someone you trust inspect it, before you pay a deposit.</li>
        <li>Check registration, insurance, and the written rental or sale agreement, including mileage, fines, Salik, fuel, excess, delivery, and cancellation.</li>
        <li>Treat an unusually low price, a last-minute change of car, account, or meeting place, or pressure to pay immediately as a warning.</li>
        <li>Never share your password or a one-time code. {site.name} will not ask for them.</li>
        <li>Do not send identity documents, card photos, or payment details through this website’s forms. Give documents only to the advertiser, and only when you have decided they are necessary.</li>
        <li>Meet in a public place where that is appropriate, and do not transfer money to an account you have not checked.</li>
      </ul>
      <h2>If you advertise</h2>
      <ul>
        <li>Advertise only a vehicle you have authority to offer, with photos of that vehicle and a WhatsApp number you answer.</li>
        <li>State the real price, deposit, mileage allowance, and whether you deliver.</li>
        <li>Do not ask customers to send identity documents through this website.</li>
      </ul>
      <h2>Report abuse</h2>
      <p>Use <Link to="/report-listing">Report a listing</Link> for a suspicious, fraudulent, misleading, or impersonated listing, a listing you believe involves a stolen vehicle, or a listing that tries to avoid moderation. Reports go to the admin queue. We may remove the listing and suspend the account. A report here is not a police report.</p>
      <p>If you are in immediate danger, contact local emergency services first. In the UAE, police emergency assistance is generally reached on 999. Confirm that number with the competent authority if you are unsure. Report stolen vehicles and fraud to the police as well as to this website. This website is not an emergency service and it is not a law-enforcement agency. We may cooperate with a competent authority when the law requires it.</p>
      <p>Read the <Link to="/marketplace-disclaimer">marketplace disclaimer</Link> and the <Link to="/terms-and-conditions">terms</Link> with this page.</p>
    </>
  );
}
