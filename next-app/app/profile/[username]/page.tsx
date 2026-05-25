import ProfileView from "./ProfileView";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ username: string }>;
}

async function getPortfolio(username: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const res = await fetch(`${apiUrl}/users/${username}/portfolio`, {
      next: { revalidate: 30 }, // cache for 30s
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data || null;
  } catch (error) {
    console.error("Error fetching portfolio on server:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const portfolio = await getPortfolio(username);
  
  if (!portfolio || !portfolio.profile) {
    return {
      title: "Developer Profile | Skill Wallet",
      description: "Verified developer skills, achievements, and badges.",
    };
  }

  const p = portfolio.profile;
  const name = p.displayName || p.username || username;
  const title = p.title || "Developer";
  const bio = p.bio || `View verified skills and professional credentials of ${name} on Skill Wallet.`;

  return {
    title: `${name} (${title}) | Skill Wallet`,
    description: bio,
    openGraph: {
      title: `${name} - Verified Developer Portfolio`,
      description: bio,
      images: p.avatarUrl || p.photoURL ? [{ url: p.avatarUrl || p.photoURL }] : [],
    },
  };
}

export default async function Page({ params }: Props) {
  const { username } = await params;
  const initialPortfolio = await getPortfolio(username);

  return <ProfileView username={username} initialPortfolio={initialPortfolio} />;
}
