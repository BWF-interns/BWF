// app/student/profile/page.tsx (server component)
import ProfilePage from "./ProfilePage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aisha Sharma - Profile",
  description:
    "View and edit your personal information, contact details, and interests.",
};

export default function ServerProfilePage() {
  return <ProfilePage />;
}
