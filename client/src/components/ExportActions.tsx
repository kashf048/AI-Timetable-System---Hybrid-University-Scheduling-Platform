import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";

interface ExportActionsProps {
  timetableId: number;
  timetableName?: string;
}

export default function ExportActions({ timetableId, timetableName }: ExportActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const exportPDFMutation = trpc.export.toPDF.useMutation();
  const exportExcelMutation = trpc.export.toExcel.useMutation();
  const exportJSONMutation = trpc.export.toJSON.useMutation();
  const exportCSVMutation = trpc.export.toCSV.useMutation();

  const handleDownload = (data: string, filename: string, mimeType: string) => {
    try {
      const binaryString = atob(data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded ${filename}`);
    } catch (error) {
      toast.error("Failed to download file");
    }
  };

  const handleExportPDF = async () => {
    setIsLoading(true);
    try {
      const result = await exportPDFMutation.mutateAsync({
        timetableId,
        title: timetableName,
        includeScore: true,
      });
      handleDownload(result.data, result.filename, "application/pdf");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "PDF export failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setIsLoading(true);
    try {
      const result = await exportExcelMutation.mutateAsync({
        timetableId,
        title: timetableName,
        includeScore: true,
      });
      handleDownload(result.data, result.filename, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Excel export failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportJSON = async () => {
    setIsLoading(true);
    try {
      const result = await exportJSONMutation.mutateAsync({
        timetableId,
      });
      const blob = new Blob([result.data], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded ${result.filename}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "JSON export failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setIsLoading(true);
    try {
      const result = await exportCSVMutation.mutateAsync({
        timetableId,
      });
      const blob = new Blob([result.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded ${result.filename}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "CSV export failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Timetable</CardTitle>
        <CardDescription>Download your timetable in various formats</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Button
          onClick={handleExportPDF}
          disabled={isLoading}
          variant="outline"
          className="flex flex-col gap-2 h-auto py-4"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          <span className="text-xs">PDF</span>
        </Button>

        <Button
          onClick={handleExportExcel}
          disabled={isLoading}
          variant="outline"
          className="flex flex-col gap-2 h-auto py-4"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          <span className="text-xs">Excel</span>
        </Button>

        <Button
          onClick={handleExportJSON}
          disabled={isLoading}
          variant="outline"
          className="flex flex-col gap-2 h-auto py-4"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          <span className="text-xs">JSON</span>
        </Button>

        <Button
          onClick={handleExportCSV}
          disabled={isLoading}
          variant="outline"
          className="flex flex-col gap-2 h-auto py-4"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          <span className="text-xs">CSV</span>
        </Button>
      </CardContent>
    </Card>
  );
}
