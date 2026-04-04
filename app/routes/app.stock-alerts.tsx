import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Card,
  BlockStack,
  Text,
  IndexTable,
  Badge,
  InlineGrid,
  EmptyState,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { connectDB } from "../db.server";
import { Subscriber } from "../.server/models/subscriber.model";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  await connectDB();

  const [subscribers, totalWaiting, totalNotified] = await Promise.all([
    Subscriber.find({ shopId: session.shop, source: "back_in_stock" })
      .sort({ subscribedAt: -1 })
      .limit(100)
      .lean(),
    Subscriber.countDocuments({
      shopId: session.shop,
      source: "back_in_stock",
      status: "active",
    }),
    Subscriber.countDocuments({
      shopId: session.shop,
      source: "back_in_stock",
      status: "notified",
    }),
  ]);

  return json({
    subscribers: subscribers.map((s) => ({
      id: s._id.toString(),
      email: s.email,
      productTitle: s.productTitle || "N/A",
      variantTitle: s.variantTitle || "Default",
      status: s.status,
      date: s.subscribedAt?.toISOString(),
    })),
    totalWaiting,
    totalNotified,
  });
};

export default function StockAlertsPage() {
  const { subscribers, totalWaiting, totalNotified } =
    useLoaderData<typeof loader>();

  return (
    <Page
      title="Back-in-Stock Alerts"
      backAction={{ content: "Dashboard", url: "/app" }}
    >
      <BlockStack gap="500">
        <InlineGrid columns={3} gap="400">
          <Card>
            <BlockStack gap="200">
              <Text as="p" tone="subdued">Total Subscribers</Text>
              <Text as="p" variant="headingXl">{subscribers.length}</Text>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="200">
              <Text as="p" tone="subdued">Waiting</Text>
              <Text as="p" variant="headingXl">{totalWaiting}</Text>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="200">
              <Text as="p" tone="subdued">Notified</Text>
              <Text as="p" variant="headingXl">{totalNotified}</Text>
            </BlockStack>
          </Card>
        </InlineGrid>

        <Card>
          {subscribers.length > 0 ? (
            <IndexTable
              resourceName={{ singular: "subscriber", plural: "subscribers" }}
              itemCount={subscribers.length}
              headings={[
                { title: "Email" },
                { title: "Product" },
                { title: "Variant" },
                { title: "Status" },
                { title: "Date" },
              ]}
              selectable={false}
            >
              {subscribers.map((s, i) => (
                <IndexTable.Row id={s.id} key={s.id} position={i}>
                  <IndexTable.Cell>{s.email}</IndexTable.Cell>
                  <IndexTable.Cell>{s.productTitle}</IndexTable.Cell>
                  <IndexTable.Cell>{s.variantTitle}</IndexTable.Cell>
                  <IndexTable.Cell>
                    <Badge tone={s.status === "active" ? "warning" : "success"}>
                      {s.status === "active" ? "Waiting" : "Notified"}
                    </Badge>
                  </IndexTable.Cell>
                  <IndexTable.Cell>
                    {new Date(s.date).toLocaleDateString("en-IN")}
                  </IndexTable.Cell>
                </IndexTable.Row>
              ))}
            </IndexTable>
          ) : (
            <EmptyState
              heading="No subscribers yet"
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <p>
                When customers subscribe to out-of-stock products, they'll appear here.
                Enable the "Back in Stock Alert" block on your product pages.
              </p>
            </EmptyState>
          )}
        </Card>
      </BlockStack>
    </Page>
  );
}
