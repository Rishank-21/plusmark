export interface CustomerReview {
  id: string;
  name: string;
  quote: string;
}

/** Rating and count as shown on Plusmark's Google Business Profile. */
export const GOOGLE_REVIEW_SUMMARY = { rating: 5, count: 96 } as const;

/** Public Google Business Profile these ratings and quotes come from. */
export const GOOGLE_REVIEW_URL =
  "https://www.google.com/maps/search/?api=1&query=Plusmark+Display+System+Narolgam+Ahmedabad";

/** Verbatim quotes from Plusmark's Google Business Profile. */
export const customerReviews: CustomerReview[] = [
  {
    id: "chaudhary-sumit",
    name: "Chaudhary Sumit",
    quote:
      "I have purchased 10 white board twice, I found quality of product is excellent, plusmark not compromise on in quality, I recommend it any one want quality of white board they can approach plusmark display system."
  },
  {
    id: "arjun-goltar",
    name: "Arjun Goltar",
    quote:
      "I have purchased 20 boards from plusmark display system, I found plusmark display system provides quality products and No Compromise policy with quality, I highly recommend for purchase boards from plusmark display system."
  },
  {
    id: "desai-manoj",
    name: "Desai Manoj",
    quote:
      "Most trusted product..i was bought 25 number of display boards from here.. Good quality materials....... Nice management and shipping of products."
  },
  {
    id: "vivek-chaudhary",
    name: "Vivek Chaudhary",
    quote:
      "It's fully trustworthy product. I must give reference to other people and after sales service also too genuine and best."
  },
  {
    id: "mukesh-chaudhary",
    name: "Mukesh Chaudhary",
    quote:
      "i purchased 5 white board from plusmark display system 2 month ago very good quality and they provide fast courier service."
  },
  {
    id: "s-b-chaudhary",
    name: "S.b. Chaudhary",
    quote:
      "Plus mark display system not just providing Quality products, along with the Quality product it build Relationships."
  },
  {
    id: "abhi-chaudhary",
    name: "Abhi Chaudhary",
    quote: "One month ago me purchased 8*4 size 10 nos white board. Superb quality and fast service."
  },
  {
    id: "chaudhary-bharat",
    name: "Chaudhary Bharat",
    quote: "Good quality. Best finishing. Easy to write."
  }
];
