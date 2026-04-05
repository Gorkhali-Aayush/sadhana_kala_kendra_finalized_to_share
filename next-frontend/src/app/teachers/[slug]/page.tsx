import { Metadata } from "next";
import { getTeacherBySlug } from "@/services/teachersService";
import TeacherDetailClient from "./TeacherDetailClient";

interface Teacher {
  teacher_id?: number;
  full_name: string;
  specialization?: string;
  description?: string;
  profile_image?: string;
  slug?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  try {
    const { slug } = await params;
    const teacher = await getTeacherBySlug(slug);

    if (!teacher) {
      return {
        title: "Teacher Not Found",
        robots: { index: false },
      };
    }

    const baseUrl = "https://www.sadhanakalakendra.com";
    const canonicalUrl = `${baseUrl}/teachers/${teacher.slug || slug}`;

    return {
      title: teacher.seo_title || teacher.full_name,
      description: teacher.seo_description || `Meet ${teacher.full_name}, expert instructor in ${teacher.specialization || 'classical arts'} at Sadhana Kala Kendra`,
      keywords: teacher.seo_keywords || "classical music, instructor, teacher",
      openGraph: {
        title: teacher.seo_title || teacher.full_name,
        description: teacher.seo_description || `Meet ${teacher.full_name}, expert instructor in ${teacher.specialization || 'classical arts'} at Sadhana Kala Kendra`,
        type: "profile",
        url: canonicalUrl,
        siteName: "Sadhana Kala Kendra",
      },
      twitter: {
        card: "summary",
        title: teacher.seo_title || teacher.full_name,
        description: teacher.seo_description || `Meet ${teacher.full_name}, expert instructor in ${teacher.specialization || 'classical arts'} at Sadhana Kala Kendra`,
      },
    };
  } catch (error) {
    return {
      title: "Teacher Profile",
      description: "Faculty member profile",
    };
  }
}

export default async function TeacherDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let teacher: Teacher | null = null;
  let error: string | null = null;

  try {
    teacher = await getTeacherBySlug(slug);
  } catch (err) {
    error = "Failed to load teacher profile";
  }

  return <TeacherDetailClient teacher={teacher} error={error} slug={slug} />;
}
