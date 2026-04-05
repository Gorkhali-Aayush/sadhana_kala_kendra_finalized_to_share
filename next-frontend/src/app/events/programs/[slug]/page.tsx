import React from "react";
import Link from "next/link";
import { getProgramBySlug } from "@/services/eventsService";
import EmptyState from "@/components/EmptyState";
import SafeHTML from "@/components/SafeHTML";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProgramDetailClient from "./ProgramDetailClient";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Program {
  id?: number;
  program_id?: number;
  title?: string;
  program_name?: string;
  slug?: string;
  description?: string;
  program_description?: string;
  rich_content?: string;
  image_url?: string;
  feature_image?: string;
  program_date?: string;
  date?: string;
  created_at?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

interface ProgramResource {
  resource_id: number;
  program_id: number;
  resource_type: 'image' | 'youtube';
  resource_url: string;
  caption?: string;
  sort_order?: number;
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const program = await getProgramBySlug(slug);
    
    if (!program) {
      return {
        title: "Program Not Found",
        description: "This program could not be found.",
      };
    }

    const programTitle = program.title || program.program_name || 'Program';
    const title = program.seo_title || `${programTitle} | Sadhana Kala Kendra`;
    const description = program.seo_description || (program.description || program.program_description)?.substring(0, 160) || `Explore ${programTitle}`;
    const imageUrl = program.image_url?.startsWith("http") 
      ? program.image_url 
      : (program.image_url ? `${API_BASE_URL}${program.image_url}` : "/1626688345_logo.png");

    const programDate = program.program_date || program.date || program.created_at;
    const publishedTime = programDate ? new Date(programDate).toISOString() : undefined;

    return {
      title,
      description,
      keywords: program.seo_keywords || `${programTitle}, program, event`,
      openGraph: {
        title,
        description,
        type: "article",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: programTitle,
          },
        ],
        ...(publishedTime && { publishedTime }),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    return {
      title: "Program",
      description: "Explore programs at Sadhana Kala Kendra",
    };
  }
}

export default async function ProgramDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let program: Program | null = null;
  let resources: ProgramResource[] = [];
  let error: string | null = null;

  try {
    program = await getProgramBySlug(slug);
    
    if (!program) {
      notFound();
    }

    // Fetch resources if program_id is available
    const programId = program?.program_id || program?.id;
    
    if (programId) {
      try {
        const resourceUrl = `${API_BASE_URL}/api/events/programs/${programId}/resources`;
        
        const response = await fetch(resourceUrl, {
          cache: 'no-cache'
        });
        
        if (response.ok) {
          const resourcesData = await response.json();
          
          // Sort resources by sort_order to maintain proper display order
          const sortedResources = (resourcesData || []).sort((a: any, b: any) =>
            (a.sort_order || 0) - (b.sort_order || 0)
          );
          resources = sortedResources;
        }
      } catch (err) {
        // Error fetching resources, continue without them
        resources = [];
      }
    }
  } catch (err: any) {
    error = err?.message || "Failed to load program";
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <EmptyState
            title="Program Not Found"
            description={error || "The program could not be found"}
          />
          <Link
            href="/events"
            className="inline-block mt-6 bg-[#cf0408] hover:bg-[#a90306] text-white font-semibold px-6 py-3 rounded-full transition"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  if (!program) {
    notFound();
  }

  return <ProgramDetailClient program={program} resources={resources} />;
}
