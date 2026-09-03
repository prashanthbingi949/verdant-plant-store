# Verdant customer notifications

The admin order status workflow can automatically notify customers when an order changes to `shipped` or `delivered`.

## Email via Resend

Add these server-side environment variables to `.env.local` (and the same values in your production host later):

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=Verdant <orders@yourdomain.com>
```

`RESEND_FROM_EMAIL` should use a sender/domain configured for sending in your Resend account. The notification code calls Resend's email API directly, so no npm package is required.

## WhatsApp via Meta WhatsApp Cloud API

Automatic WhatsApp notifications require a WhatsApp Business/Cloud API setup and an approved message template. Add:

```env
WHATSAPP_ACCESS_TOKEN=your_meta_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_GRAPH_VERSION=vXX.X
WHATSAPP_TEMPLATE_NAME=verdant_order_update
WHATSAPP_TEMPLATE_LANGUAGE=en_US
```

The template should contain two body variables in this order:

```text
{{1}} = customer name
{{2}} = order ID
```

The app sends the same approved template when the status becomes `shipped` or `delivered`. Keep the access token server-side; never use these variables with a `NEXT_PUBLIC_` prefix.

## WhatsApp fallback

Even without the Cloud API variables, the admin order detail shows an **Open WhatsApp message** button when a valid customer phone number exists. This opens a pre-filled WhatsApp message for the admin to send manually.

## Testing

1. Add the environment variables to `.env.local`.
2. Restart `npm run dev`.
3. Open `/admin/orders` and expand a paid order.
4. Change the order status to `Shipped`.
5. Confirm the success message in the admin UI and check your email/WhatsApp provider logs.
6. Change the order to `Delivered` and test again.

If a notification provider is not configured, the order status still saves successfully; the admin UI reports that no automatic notification was sent.
