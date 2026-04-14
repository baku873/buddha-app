# Payment Processing & App Store Guidelines

## App Store Guideline 3.1.3 Exemption
This document serves as reference for our payment processing architecture, particularly regarding compliance with Apple's App Store Review Guidelines.

### Physical/Real-World Services Exemption
The Tibetan application utilizes QPay (a local Mongolian payment gateway) for transactions. We are utilizing a third-party payment gateway instead of Apple's In-App Purchase (IAP) system because the transactions strictly fall under the physical goods and services exemption.

As per **App Store Review Guideline 3.1.3(e) Goods and Services Outside of the App**, apps that allow people to purchase physical goods or services that will be consumed outside of the app must use purchase methods other than in-app purchase.

The payments processed in this application are for **live, real-world ritual sessions with monks**. The experience facilitated by the booking is synonymous with booking an in-person or live tele-service strictly classified as a real-world service out of the scope of digital content consumption.

### Comparable Models
Our booking and payment model is identical to platforms that exclusively broker real-world services, such as:
- **Uber** / **Lyft**: Booking a physical ride service.
- **Airbnb**: Booking a physical accommodation.
- **Consultation Apps**: Booking live sessions with medical professionals or contractors.

No digital goods, premium content unlockables, or subscription features are gated behind these payments. Therefore, StoreKit IAP does not apply, and third-party gateways (QPay) are properly instituted.
