import { SettingsForm } from "@/components/admin/settings-form";
import { getSiteSettings, getAllSocialLinks } from "@/lib/data/settings";

export default async function AdminSettingsPage() {
  const [settings, socialLinks] = await Promise.all([getSiteSettings(), getAllSocialLinks()]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Settings</h1>
      <div className="mt-8">
        <SettingsForm settings={settings} socialLinks={socialLinks} />
      </div>
    </div>
  );
}
