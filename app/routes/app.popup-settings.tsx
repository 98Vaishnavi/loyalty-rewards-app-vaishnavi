import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import {
  Page, Layout, Card, BlockStack, Text, TextField, Button,
  Checkbox, Select, InlineGrid, Divider, Banner,
} from "@shopify/polaris";
import { useState, useCallback } from "react";
import { authenticate } from "../shopify.server";
import { connectDB } from "../db.server";
import { getOrCreatePopupSettings, PopupSettings } from "../.server/models/popup-settings.model";
import { Subscriber } from "../.server/models/subscriber.model";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  await connectDB();
  const settings = await getOrCreatePopupSettings(session.shop);
  const totalCaptures = await Subscriber.countDocuments({
    shopId: session.shop, source: "exit_popup",
  });
  return json({ settings: JSON.parse(JSON.stringify(settings)), totalCaptures });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  await connectDB();
  const data = Object.fromEntries(await request.formData());

  await PopupSettings.findOneAndUpdate(
    { shopId: session.shop },
    {
      $set: {
        enabled: data.enabled === "true",
        headline: data.headline || "",
        subtext: data.subtext || "",
        discountType: data.discountType || "percentage",
        discountValue: Number(data.discountValue) || 10,
        buttonText: data.buttonText || "Get My Discount",
        successMessage: data.successMessage || "",
        bgColor: data.bgColor || "#ffffff",
        accentColor: data.accentColor || "#5C6AC4",
        showOnMobile: data.showOnMobile === "true",
        delaySeconds: Number(data.delaySeconds) || 5,
      },
    },
    { upsert: true },
  );
  return json({ success: true });
};

export default function PopupSettingsPage() {
  const { settings, totalCaptures } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const nav = useNavigation();

  const [s, setS] = useState({ ...settings });
  const u = (f: string) => (v: string | boolean) => setS((p: any) => ({ ...p, [f]: v }));

  const save = useCallback(() => {
    const fd = new FormData();
    Object.entries(s).forEach(([k, v]) => { if (k !== "_id" && k !== "__v" && k !== "shopId") fd.set(k, String(v)); });
    submit(fd, { method: "post" });
  }, [s, submit]);

  return (
    <Page title="Exit-Intent Popup" primaryAction={{ content: "Save", onAction: save, loading: nav.state === "submitting" }} backAction={{ content: "Dashboard", url: "/app" }}>
      <BlockStack gap="500">
        <Layout>
          <Layout.AnnotatedSection title="Popup Status" description={`Total emails captured: ${totalCaptures}`}>
            <Card>
              <Checkbox label="Enable Exit-Intent Popup" checked={s.enabled} onChange={u("enabled")} />
            </Card>
          </Layout.AnnotatedSection>

          <Layout.AnnotatedSection title="Content" description="Customize the popup message and discount.">
            <Card>
              <BlockStack gap="400">
                <TextField label="Headline" value={s.headline} onChange={u("headline")} autoComplete="off" />
                <TextField label="Sub Text" value={s.subtext} onChange={u("subtext")} autoComplete="off" />
                <InlineGrid columns={2} gap="300">
                  <Select label="Discount Type" options={[{ label: "Percentage (%)", value: "percentage" }, { label: "Fixed Amount (₹)", value: "fixed_amount" }]} value={s.discountType} onChange={u("discountType")} />
                  <TextField label="Discount Value" type="number" value={String(s.discountValue)} onChange={(v) => setS((p: any) => ({ ...p, discountValue: Number(v) }))} autoComplete="off" />
                </InlineGrid>
                <TextField label="Button Text" value={s.buttonText} onChange={u("buttonText")} autoComplete="off" />
                <TextField label="Success Message" value={s.successMessage} onChange={u("successMessage")} autoComplete="off" />
              </BlockStack>
            </Card>
          </Layout.AnnotatedSection>

          <Layout.AnnotatedSection title="Appearance & Behavior" description="Colors and trigger settings.">
            <Card>
              <BlockStack gap="400">
                <InlineGrid columns={2} gap="300">
                  <TextField label="Background Color" value={s.bgColor} onChange={u("bgColor")} autoComplete="off" />
                  <TextField label="Accent Color" value={s.accentColor} onChange={u("accentColor")} autoComplete="off" />
                </InlineGrid>
                <TextField label="Delay (seconds)" type="number" value={String(s.delaySeconds)} onChange={(v) => setS((p: any) => ({ ...p, delaySeconds: Number(v) }))} helpText="Don't show popup before this many seconds" autoComplete="off" />
                <Checkbox label="Show on mobile devices" checked={s.showOnMobile} onChange={u("showOnMobile")} />
              </BlockStack>
            </Card>
          </Layout.AnnotatedSection>
        </Layout>
        <Banner tone="info"><p>Enable "Exit Popup" in Theme Editor → App embeds after saving.</p></Banner>
      </BlockStack>
    </Page>
  );
}
