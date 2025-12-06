"use client";

import * as React from "react";
import {
  Search,
  FileSpreadsheet,
  FileText,
  Download,
  Upload,
  Filter,
  ChevronDown,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";

import PageLayout from "@/components/dashboard/PageLayout";
import { useToast } from "@/hooks/use-toast";
import { alumniApi } from "@/lib/api";

// Alumni interface matching backend
interface AlumniData {
  _id: string;
  userId?: {
    name?: string;
    email?: string;
    phone?: string;
  } | string;
  name?: string;
  email?: string;
  phone?: string;
  degree?: string;
  department?: string;
  graduationYear?: string | number;
  enrollmentNo?: string;
  verified?: boolean;
}

export default function AnalyticsPage() {
  const [alumniData, setAlumniData] = React.useState<AlumniData[]>([]);
  const [filteredData, setFilteredData] = React.useState<AlumniData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filters, setFilters] = React.useState({
    degree: "",
    department: "",
    batch: "",
  });
  const { toast } = useToast();

  // Fetch alumni data from backend
  React.useEffect(() => {
    fetchAlumniData();
  }, []);

  const fetchAlumniData = async () => {
    try {
      setLoading(true);
      const response = await alumniApi.getAll();
      const data = response.data?.data || [];
      setAlumniData(data);
      setFilteredData(data);
    } catch (error) {
      console.error("Failed to fetch alumni:", error);
      toast({
        title: "Error",
        description: "Failed to load alumni data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  React.useEffect(() => {
    let filtered = [...alumniData];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((alumni) => {
        const name = alumni.name || (alumni.userId as any)?.name || "";
        const email = alumni.email || (alumni.userId as any)?.email || "";
        const phone = alumni.phone || (alumni.userId as any)?.phone || "";
        const enrollmentNo = alumni.enrollmentNo || "";

        return (
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          phone.includes(searchTerm) ||
          enrollmentNo.includes(searchTerm)
        );
      });
    }

    // Degree filter
    if (filters.degree) {
      filtered = filtered.filter(
        (alumni) => alumni.degree?.toLowerCase().includes(filters.degree.toLowerCase())
      );
    }

    // Department filter
    if (filters.department) {
      filtered = filtered.filter(
        (alumni) => alumni.department?.toLowerCase().includes(filters.department.toLowerCase())
      );
    }

    // Batch filter
    if (filters.batch) {
      filtered = filtered.filter(
        (alumni) => alumni.graduationYear?.toString() === filters.batch
      );
    }

    setFilteredData(filtered);
  }, [searchTerm, filters, alumniData]);

  // Export to Excel
  const handleExportExcel = () => {
    toast({
      title: "Export Started",
      description: "Preparing Excel file...",
    });
    // Implementation for Excel export would go here
  };

  // Export to PDF
  const handleExportPDF = () => {
    toast({
      title: "Export Started",
      description: "Preparing PDF file...",
    });
    // Implementation for PDF export would go here
  };

  // Download sample CSV
  const handleDownloadSample = () => {
    const csvContent = `Name,Phone,Email,Degree,Department,Graduation Year,Enrollment No
John Doe,9876543210,john@example.com,Bachelor of Technology,Computer Engineering,2024,23293916001`;
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "alumni_sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle CSV upload
  const handleUploadCSV = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        toast({
          title: "Upload Started",
          description: `Uploading ${file.name}...`,
        });
        // Implementation for CSV upload would go here
      }
    };
    input.click();
  };

  // Get unique values for filters
  const uniqueDegrees = React.useMemo(() => {
    const degrees = new Set<string>();
    alumniData.forEach((alumni) => {
      if (alumni.degree) degrees.add(alumni.degree);
    });
    return Array.from(degrees);
  }, [alumniData]);

  const uniqueDepartments = React.useMemo(() => {
    const departments = new Set<string>();
    alumniData.forEach((alumni) => {
      if (alumni.department) departments.add(alumni.department);
    });
    return Array.from(departments);
  }, [alumniData]);

  const uniqueBatches = React.useMemo(() => {
    const batches = new Set<string>();
    alumniData.forEach((alumni) => {
      if (alumni.graduationYear) batches.add(alumni.graduationYear.toString());
    });
    return Array.from(batches).sort((a, b) => parseInt(b) - parseInt(a));
  }, [alumniData]);

  // Helper function to get field value
  const getField = (alumni: AlumniData, field: keyof AlumniData) => {
    return alumni[field] || (alumni.userId as any)?.[field] || "";
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-[#ffffff] p-8 font-sans">
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#001439]">Alumni Directory</h1>
            <p className="text-[#7088aa] mt-1">Manage and track your alumni network</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#dbeaff] rounded-lg text-[#4a5f7c] text-sm font-semibold hover:bg-[#f6f9fe] hover:text-[#001145] transition-colors shadow-sm"
            >
              <FileSpreadsheet size={16} />
              Export Excel
            </button>
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#dbeaff] rounded-lg text-[#4a5f7c] text-sm font-semibold hover:bg-[#f6f9fe] hover:text-[#001145] transition-colors shadow-sm"
            >
              <FileText size={16} />
              Export PDF
            </button>
            <button 
              onClick={handleDownloadSample}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#dbeaff] rounded-lg text-[#4a5f7c] text-sm font-semibold hover:bg-[#f6f9fe] hover:text-[#001145] transition-colors shadow-sm"
            >
              <Download size={16} />
              Download Sample CSV
            </button>
            <button 
              onClick={handleUploadCSV}
              className="flex items-center gap-2 px-4 py-2 bg-[#7088aa] hover:bg-[#4a5f7c] text-white rounded-lg text-sm font-bold transition-colors shadow-md"
            >
              <Upload size={16} />
              Upload CSV
            </button>
            <button 
              onClick={fetchAlumniData}
              className="flex items-center gap-2 px-4 py-2 bg-[#001145] hover:bg-[#001439] text-white rounded-lg text-sm font-bold transition-colors shadow-md"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* --- Filter Section --- */}
        <div className="bg-white p-5 rounded-xl border border-[#dbeaff] shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#001145] font-bold text-sm flex items-center gap-2">
              <Filter size={16} /> Filters
            </h3>
            <ChevronDown size={16} className="text-[#7088aa] cursor-pointer" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8bdda]" size={18} />
              <input
                type="text"
                placeholder="Search alumni..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#f6f9fe] border border-[#dbeaff] rounded-lg text-sm text-[#001439] placeholder-[#a8bdda] focus:outline-none focus:border-[#001145] transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Degree Dropdown */}
            <select
              className="w-full px-4 py-2.5 bg-[#f6f9fe] border border-[#dbeaff] rounded-lg text-sm text-[#4a5f7c] focus:outline-none focus:border-[#001145] appearance-none cursor-pointer"
              value={filters.degree}
              onChange={(e) => setFilters({ ...filters, degree: e.target.value })}
            >
              <option value="">All Degrees</option>
              {uniqueDegrees.map((degree) => (
                <option key={degree} value={degree}>
                  {degree}
                </option>
              ))}
            </select>

            {/* Department Dropdown */}
            <select
              className="w-full px-4 py-2.5 bg-[#f6f9fe] border border-[#dbeaff] rounded-lg text-sm text-[#4a5f7c] focus:outline-none focus:border-[#001145] appearance-none cursor-pointer"
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            >
              <option value="">All Departments</option>
              {uniqueDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Batch Dropdown */}
            <select
              className="w-full px-4 py-2.5 bg-[#f6f9fe] border border-[#dbeaff] rounded-lg text-sm text-[#4a5f7c] focus:outline-none focus:border-[#001145] appearance-none cursor-pointer"
              value={filters.batch}
              onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
            >
              <option value="">All Batches</option>
              {uniqueBatches.map((batch) => (
                <option key={batch} value={batch}>
                  {batch}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl border border-[#dbeaff] shadow-sm p-12 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-[#7088aa]" />
            <p className="text-[#7088aa]">Loading alumni data...</p>
          </div>
        ) : (
          <>
            {/* --- Data Table --- */}
            <div className="bg-white rounded-xl border border-[#dbeaff] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  {/* Table Header */}
                  <thead className="bg-[#001145] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                        Degree
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                        Graduation
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                        Enrollment
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-[#e4f0ff]">
                    {filteredData.map((alumni) => (
                      <tr
                        key={alumni._id}
                        className="hover:bg-[#f6f9fe] transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-[#001439]">
                            {getField(alumni, "name") || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-[#4a5f7c]">
                            {getField(alumni, "phone") || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a
                            href={`mailto:${getField(alumni, "email")}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {getField(alumni, "email") || "N/A"}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#001439]">
                            {alumni.degree || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-[#4a5f7c]">
                            {alumni.department || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#dbeaff] text-[#001145]">
                            {alumni.graduationYear || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-[#7088aa]">
                            {alumni.enrollmentNo || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button className="text-[#a8bdda] hover:text-[#001145] transition-colors">
                            <MoreHorizontal size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State (if no data) */}
              {filteredData.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-[#7088aa]">
                    {alumniData.length === 0
                      ? "No alumni found in the database."
                      : "No alumni match your filters."}
                  </p>
                  {alumniData.length > 0 && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setFilters({ degree: "", department: "", batch: "" });
                      }}
                      className="mt-4 text-sm text-[#001145] hover:underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              )}

              {/* Simple Pagination Footer */}
              <div className="px-6 py-4 bg-white border-t border-[#dbeaff] flex items-center justify-between">
                <span className="text-sm text-[#7088aa]">
                  Showing{" "}
                  <span className="font-bold text-[#001439]">{filteredData.length}</span>{" "}
                  of <span className="font-bold text-[#001439]">{alumniData.length}</span>{" "}
                  entries
                </span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm border border-[#dbeaff] rounded hover:bg-[#f6f9fe] disabled:opacity-50">
                    Previous
                  </button>
                  <button className="px-3 py-1 text-sm border border-[#dbeaff] rounded hover:bg-[#f6f9fe] bg-[#001145] text-white">
                    1
                  </button>
                  <button className="px-3 py-1 text-sm border border-[#dbeaff] rounded hover:bg-[#f6f9fe]">
                    2
                  </button>
                  <button className="px-3 py-1 text-sm border border-[#dbeaff] rounded hover:bg-[#f6f9fe]">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
