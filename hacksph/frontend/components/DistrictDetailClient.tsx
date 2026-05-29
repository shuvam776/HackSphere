"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRole } from "@/lib/RoleContext";
import { fetchOpenMeteoWeather } from "@/lib/api";
import { getRiskBadgeClass, getRiskColor } from "@/utils/helpers";
import type { ClinicalCaseRecord, IndustrialContaminationLog, PublicComplaint, Report, Village } from "@/types/report";

const weatherDescriptions: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Heavy rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail",
};

interface Props {
  districtName: string;
}

interface WeatherState {
  temperature?: number;
  windspeed?: number;
  precipitation?: number;
  weathercode?: number;
  description?: string;
  loading: boolean;
  error?: string;
}

export default function DistrictDetailClient({ districtName }: Props) {
  const {
    villagesList,
    symptomReports,
    industrialLogs,
    clinicalRecords,
    publicComplaints,
    alerts,
  } = useRole();

  const village = useMemo(
    () => villagesList.find((v) => v.name.toLowerCase() === districtName.toLowerCase()),
    [villagesList, districtName]
  );

  const [weather, setWeather] = useState<WeatherState>({ loading: true });

  useEffect(() => {
    if (!village) return;

    setWeather({ loading: true });

    fetchOpenMeteoWeather(village.latitude, village.longitude)
      .then((data) => {
        const current = data?.current_weather;
        const precipitation = data?.hourly?.precipitation?.[0] ?? 0;
        const weathercode = current?.weathercode;
        const descriptionText =
          weathercode !== undefined && weathercode !== null
            ? weatherDescriptions[weathercode] || "Unknown weather"
            : "Unknown weather";

        setWeather({
          loading: false,
          temperature: current?.temperature,
          windspeed: current?.windspeed,
          precipitation,
          weathercode,
          description: descriptionText,
        });
      })
      .catch((error) => {
        setWeather({ loading: false, error: error?.message || "Unable to fetch weather." });
      });
  }, [village]);

  const villageReports = symptomReports.filter((r) => r.village === village?.name);
  const villageIndustry = industrialLogs.filter((log) => log.village === village?.name);
  const villageClinical = clinicalRecords.filter((rec) => rec.village === village?.name);
  const villageComplaints = publicComplaints.filter((c) => c.village === village?.name);
  const villageAlerts = alerts.filter((a) => a.village === village?.name);

  if (!village) {
    return (
      <div className="min-h-screen bg-grid relative">
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="relative z-10 max-w-xl mx-auto px-4 py-12">
          <div className="glass-card rounded-3xl p-8 border border-slate-200 text-center">
            <h1 className="text-2xl font-black text-slate-900">District Not Found</h1>
            <p className="mt-3 text-sm text-slate-500">We could not locate the requested district dossier in the current surveillance list.</p>
            <Link href="/admin" className="mt-6 inline-flex items-center justify-center rounded-full bg-primary-500 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-lg shadow-primary-500/15">
              Back to Admin Control Room
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalComplaints = villageComplaints.length;
  const totalReports = villageReports.length;
  const totalIndustry = villageIndustry.length;
  const totalClinical = villageClinical.length;

  const topClinicalCases = villageClinical.reduce(
    (acc, item) => {
      acc.cholera += item.choleraCases;
      acc.diarrhea += item.diarrheaCases;
      acc.typhoid += item.typhoidCases;
      acc.malaria += item.malariaCases;
      acc.bedOccupancy = Math.max(acc.bedOccupancy, item.bedOccupancy);
      if (item.medicineStock === "critical") acc.criticalMeds += 1;
      return acc;
    },
    {
      cholera: 0,
      diarrhea: 0,
      typhoid: 0,
      malaria: 0,
      bedOccupancy: 0,
      criticalMeds: 0,
    }
  );

  const hasIndustrialData = villageIndustry.length > 0;
  const topTds = Math.max(...villageIndustry.map((log) => log.tds), 0);
  const avgPh = villageIndustry.length > 0 ? Number((villageIndustry.reduce((sum, log) => sum + log.ph, 0) / villageIndustry.length).toFixed(1)) : undefined;

  return (
    <div className="min-h-screen bg-grid relative">
      <div className="absolute inset-0 bg-radial-glow" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 pb-24">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <Link href="/admin" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900">
              ← Back to Control Room
            </Link>
            <h1 className="mt-4 text-3xl font-black text-slate-900 tracking-tight">{village.name} District Dossier</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Full operational summary for the selected district, including live weather telemetry, industrial water quality logs, clinical caseloads, recent complaints, and active outbreak alerts.
            </p>
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600">
            Risk Score: <span className="font-black" style={{ color: getRiskColor(village.riskLevel) }}>{village.riskScore}%</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="glass-card rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-4">District Snapshot</h2>
            <div className="space-y-4 text-sm text-slate-600">
              <div className="rounded-3xl bg-slate-50 p-4 border border-slate-100">
                <div className="text-[11px] uppercase text-slate-400 tracking-[0.18em] mb-2">Current Weather</div>
                {weather.loading ? (
                  <div className="text-xs text-slate-400">Loading live weather...</div>
                ) : weather.error ? (
                  <div className="text-xs text-danger-500">{weather.error}</div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-4xl font-black text-slate-900">{weather.temperature?.toFixed(1)}°C</div>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      <span>Condition: {weather.description}</span>
                      <span>Wind: {weather.windspeed?.toFixed(1)} km/h</span>
                      <span>Precip.: {weather.precipitation?.toFixed(1)} mm</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-3xl bg-slate-50 p-4 border border-slate-100">
                <div className="text-[11px] uppercase text-slate-400 tracking-[0.18em] mb-2">Environmental Hazard</div>
                <div className="text-slate-900 font-black text-2xl">{village.riskLevel}</div>
                <div className="mt-2 text-xs text-slate-500">This district is currently scored from the live surveillance engine and water risk model.</div>
              </div>

              <div className="rounded-3xl bg-slate-50 p-4 border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[11px] uppercase text-slate-400 tracking-[0.18em]">Alerts</div>
                    <div className="text-2xl font-black text-slate-900">{villageAlerts.length}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${getRiskBadgeClass(village.riskLevel)}`}>
                    {village.riskLevel}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {villageAlerts.length > 0
                    ? villageAlerts[0].status === "active"
                      ? "Active outbreak response is live."
                      : "No active alerts, monitoring continues."
                    : "No alert entries for this district."}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Weather & Operational Metrics</h2>
                <p className="text-xs text-slate-500 mt-1">Live API weather data sourced from Open-Meteo and combined with district telemetry.</p>
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">District coordinates</div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5 border border-slate-100">
                <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400 mb-3">Temperature</div>
                <div className="text-4xl font-black text-slate-900">{weather.loading ? "--" : weather.temperature?.toFixed(1) ?? "--"}°C</div>
                <div className="mt-2 text-xs text-slate-500">Current measured temperature at location.</div>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5 border border-slate-100">
                <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400 mb-3">Chance of Precipitation</div>
                <div className="text-4xl font-black text-slate-900">{weather.loading ? "--" : weather.precipitation?.toFixed(1) ?? "0.0"} mm</div>
                <div className="mt-2 text-xs text-slate-500">This hour's precipitation estimate from API.</div>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5 border border-slate-100">
                <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400 mb-3">Wind Speed</div>
                <div className="text-4xl font-black text-slate-900">{weather.loading ? "--" : weather.windspeed?.toFixed(1) ?? "--"} km/h</div>
                <div className="mt-2 text-xs text-slate-500">Useful for flood plume and contamination dispersion analysis.</div>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5 border border-slate-100">
                <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400 mb-3">Coordinates</div>
                <div className="text-slate-900 font-black">{village.latitude.toFixed(4)}, {village.longitude.toFixed(4)}</div>
                <div className="mt-2 text-xs text-slate-500">Latitude / longitude tied to the map overlay.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2 mt-6">
          <div className="glass-card rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Industrial Contamination</h3>
                <p className="text-xs text-slate-500 mt-1">Latest water quality and effluent reports logged by ASHA workers.</p>
              </div>
              <span className="text-xs font-semibold text-slate-600">Entries: {totalIndustry}</span>
            </div>
            {hasIndustrialData ? (
              <div className="space-y-4">
                {villageIndustry.slice(0, 3).map((log) => (
                  <div key={log.id} className="rounded-3xl bg-slate-50 p-4 border border-slate-100">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <span className="text-[12px] font-black text-slate-900">{log.date}</span>
                      <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Effluent: {log.effluentLevel}</span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 text-xs text-slate-600">
                      <div>Water Colour: {log.waterColor}</div>
                      <div>pH: {log.ph.toFixed(1)}</div>
                      <div>Turbidity: {log.turbidity} NTU</div>
                      <div>TDS: {log.tds} ppm</div>
                    </div>
                    <div className="mt-3 text-[10px] text-slate-500">Chemicals: {log.chemicals.join(", ")}</div>
                    <div className="mt-2 text-[10px] text-slate-400">Reported by: {log.reportedBy}</div>
                  </div>
                ))}
                <div className="rounded-3xl bg-slate-100 px-4 py-3 text-xs text-slate-500 border border-slate-200">
                  Highest recorded TDS: <span className="font-semibold text-slate-900">{topTds} ppm</span> and average pH: <span className="font-semibold text-slate-900">{avgPh ?? "n/a"}</span>.
                </div>
              </div>
            ) : (
              <div className="rounded-3xl bg-slate-50 p-8 text-center text-sm text-slate-400 border border-slate-100">
                No industrial contamination logs are available yet for this district.
              </div>
            )}
          </div>

          <div className="glass-card rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Clinical & Public Health</h3>
                <p className="text-xs text-slate-500 mt-1">Medical case trends and community feedback for the selected district.</p>
              </div>
              <span className="text-xs font-semibold text-slate-600">Reports: {totalReports}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 text-sm text-slate-600">
              <div className="rounded-3xl bg-slate-50 p-4 border border-slate-100">
                <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400 mb-2">Hospital Admissions</div>
                <div className="text-3xl font-black text-slate-900">{topClinicalCases.cholera}</div>
                <div className="mt-1 text-xs text-slate-500">Cholera cases total</div>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 border border-slate-100">
                <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400 mb-2">Village Sickness</div>
                <div className="text-3xl font-black text-slate-900">{topClinicalCases.diarrhea}</div>
                <div className="mt-1 text-xs text-slate-500">Diarrhea cases total</div>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 border border-slate-100">
                <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400 mb-2">Bed Occupancy</div>
                <div className="text-3xl font-black text-slate-900">{topClinicalCases.bedOccupancy}%</div>
                <div className="mt-1 text-xs text-slate-500">Peak hospital load</div>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 border border-slate-100">
                <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400 mb-2">Meds Stock Alerts</div>
                <div className="text-3xl font-black text-slate-900">{topClinicalCases.criticalMeds}</div>
                <div className="mt-1 text-xs text-slate-500">Critical supply reports</div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {villageComplaints.length === 0 ? (
                <div className="rounded-3xl bg-slate-50 p-4 border border-slate-100 text-sm text-slate-500">No community complaints have been filed yet for this district.</div>
              ) : (
                villageComplaints.slice(0, 3).map((complaint) => (
                  <div key={complaint.id} className="rounded-3xl bg-slate-50 p-4 border border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>{complaint.date}</span>
                      <span>{complaint.issueType.toUpperCase()}</span>
                    </div>
                    <p className="text-sm text-slate-700 font-semibold">{complaint.complainant}</p>
                    <p className="mt-2 text-xs text-slate-500 leading-relaxed">{complaint.details}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-[0.18em]">Detailed Report Timeline</h3>
              <p className="text-xs text-slate-500 mt-1">Latest submitted case reports and water quality entries for the district.</p>
            </div>
            <div className="text-xs text-slate-400">Weather API: Open-Meteo</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-[0.18em] text-[9px]">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {villageIndustry.slice(0, 2).map((log) => (
                  <tr key={`i-${log.id}`} className="border-b border-slate-200 hover:bg-white transition-colors">
                    <td className="py-3 px-3">{log.date}</td>
                    <td className="py-3 px-3">Industrial Water Quality</td>
                    <td className="py-3 px-3">{log.effluentLevel}</td>
                    <td className="py-3 px-3">TDS {log.tds} ppm • pH {log.ph}</td>
                  </tr>
                ))}
                {villageReports.slice(0, 2).map((report) => (
                  <tr key={`r-${report.id}`} className="border-b border-slate-200 hover:bg-white transition-colors">
                    <td className="py-3 px-3">{report.date}</td>
                    <td className="py-3 px-3">Household health survey</td>
                    <td className="py-3 px-3">{report.waterCondition}</td>
                    <td className="py-3 px-3">Fever {report.fever}, Diarrhea {report.diarrhea}</td>
                  </tr>
                ))}
                {villageClinical.slice(0, 2).map((record) => (
                  <tr key={`c-${record.id}`} className="border-b border-slate-200 hover:bg-white transition-colors">
                    <td className="py-3 px-3">{record.date}</td>
                    <td className="py-3 px-3">Clinical admission</td>
                    <td className="py-3 px-3">{record.bedOccupancy}% beds</td>
                    <td className="py-3 px-3">Cholera {record.choleraCases}, Typhoid {record.typhoidCases}</td>
                  </tr>
                ))}
                {villageIndustry.length + villageReports.length + villageClinical.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">No detailed entries available yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
