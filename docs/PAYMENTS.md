# Payment Processing & App Store Guidelines

## App Store Guideline 3.1.3 Exemption
This document serves as reference for our payment processing architecture, particularly regarding compliance with Apple's App Store Review Guidelines.

### Person-to-Person Experiences Exemption
The Tibetan application utilizes QPay (a local Mongolian payment gateway) for transactions. We are utilizing a third-party payment gateway instead of Apple's In-App Purchase (IAP) system because the transactions strictly fall under the person-to-person experiences exemption.

As per **App Store Review Guideline 3.1.3(d) Person-to-Person Experiences**, apps that offer real-time person-to-person services between two individuals (for example tutoring students, medical consultations, real estate tours, or fitness training) may use purchase methods other than in-app purchase to collect those payments.

The payments processed in this application are for **live, real-time 1-on-1 person-to-person spiritual consultations with monks**. The experience facilitated by the booking is synonymous with booking a live tele-service strictly classified as a person-to-person experience out of the scope of digital content consumption. No recorded video content is available for purchase.

### Comparable Models
Our booking and payment model is identical to platforms that exclusively broker real-world services, such as:
- **Uber** / **Lyft**: Booking a physical ride service.
- **Airbnb**: Booking a physical accommodation.
- **Consultation Apps**: Booking live sessions with medical professionals or contractors.

No digital goods, premium content unlockables, or subscription features are gated behind these payments. Therefore, StoreKit IAP does not apply, and third-party gateways (QPay) are properly instituted.
