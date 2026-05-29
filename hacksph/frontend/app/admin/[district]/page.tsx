import DistrictDetailClient from "@/components/DistrictDetailClient";
import { villages as defaultVillages } from "@/lib/mockData";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    district: string;
  };
}

export default function DistrictDetailPage({ params }: PageProps) {
  const districtName = decodeURIComponent(params.district || "");
  const matchedVillage = defaultVillages.find(
    (v) => v.name.toLowerCase() === districtName.toLowerCase()
  );

  if (!matchedVillage) {
    return notFound();
  }

  return <DistrictDetailClient districtName={matchedVillage.name} />;
}
