import { privacyPolicyDocs } from "../docs";
import RenderMarkdown from "@/components/markdown/RenderMarkdown";

export default function PrivacyPolicy() {
  return (
    <div className="w-full">
      <div className="mt-3 py-2">
        <RenderMarkdown content={privacyPolicyDocs} />
      </div>
    </div>
  );
}
