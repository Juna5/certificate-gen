"use client";
import React, { useState, useRef } from "react";
import {
    Upload,
    Download,
    Eye,
    FileText,
    Settings,
    Users,
    ExternalLink,
    HelpCircle,
    Coffee,
    Heart,
} from "lucide-react";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import NextImage from "next/image";
interface CertificateData {
    id: number;
    nama: string;
    remark1: string;
    remark2: string;
    remark3: string;
}

interface Position {
    x: number;
    y: number;
}

interface RemarkPositions {
    remark1: Position;
    remark2: Position;
    remark3: Position;
}

const Home: React.FC = () => {
    const [excelData, setExcelData] = useState<CertificateData[]>([]);
    const [nameFont, setNameFont] = useState<string | null>(null);
    const [remarkFont, setRemarkFont] = useState<string | null>(null);
    const [nameFontSize, setNameFontSize] = useState<number>(60);
    const [remarkFontSize, setRemarkFontSize] = useState<number>(30);
    const [currentPreview, setCurrentPreview] = useState<number>(0);
    const [showPreview, setShowPreview] = useState<boolean>(false);
    const [nameColor, setNameColor] = useState<string>("#000000");
    const [remarkColor, setRemarkColor] = useState<string>("#000000");
    const [certificateTemplate, setCertificateTemplate] =
        useState<HTMLImageElement | null>(null);
    const [namePosition, setNamePosition] = useState<Position>({
        x: 445,
        y: 382,
    });
    const [remarkPositions, setRemarkPositions] = useState<RemarkPositions>({
        remark1: { x: 445, y: 420 },
        remark2: { x: 445, y: 460 },
        remark3: { x: 445, y: 500 },
    });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const excelInputRef = useRef<HTMLInputElement>(null);
    const nameFontInputRef = useRef<HTMLInputElement>(null);
    const remarkFontInputRef = useRef<HTMLInputElement>(null);
    const templateInputRef = useRef<HTMLInputElement>(null);

    const downloadExcelSample = (): void => {
        const sampleData = [
            ["Nama", "Remark 1", "Remark 2", "Remark 3"],
            ["John Doe", "Completed Course A", "With Distinction", ""],
            ["Jane Smith", "Completed Course B", "", ""],
        ];
        const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, "sample_certificate_data.xlsx");
    };

    const downloadCertificateSample = (): void => {
        const link = document.createElement("a");
        link.href = `${window.location.origin}/assets/example.jpg`; // ambil dari public
        link.download = "certificate-sample.jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExcelUpload = (
        e: React.ChangeEvent<HTMLInputElement>
    ): void => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event: ProgressEvent<FileReader>) => {
                if (!event.target?.result) return;

                const data = new Uint8Array(event.target.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                });

                // Skip header row and format data
                const formattedData: CertificateData[] = jsonData
                    .slice(1)
                    .map((row, index) => ({
                        id: index + 1,
                        nama: row[0] || "",
                        remark1: row[1] || "",
                        remark2: row[2] || "",
                        remark3: row[3] || "",
                    }));

                setExcelData(formattedData);
                setShowPreview(formattedData.length > 0);
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const handleTemplateUpload = (
        e: React.ChangeEvent<HTMLInputElement>
    ): void => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event: ProgressEvent<FileReader>) => {
                if (!event.target?.result) return;

                const img = new Image();
                img.onload = () => {
                    setCertificateTemplate(img);
                    setShowPreview(excelData.length > 0);
                };
                img.src = event.target.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFontUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: "name" | "remark"
    ): void => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            const fontName = file.name.replace(/\.[^/.]+$/, "");

            // Create font face
            const font = new FontFace(fontName, `url(${url})`);
            font.load().then(() => {
                document.fonts.add(font);
                if (type === "name") {
                    setNameFont(fontName);
                } else {
                    setRemarkFont(fontName);
                }
            });
        }
    };

    const generateCertificate = (
        data: CertificateData,
        canvasElement?: HTMLCanvasElement
    ): void => {
        const canvas = canvasElement || canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        if (!certificateTemplate) {
            // Fallback to simple template if no image uploaded
            canvas.width = 1200;
            canvas.height = 800;

            // Simple gradient background
            const gradient = ctx.createLinearGradient(
                0,
                0,
                canvas.width,
                canvas.height
            );
            gradient.addColorStop(0, "#667eea");
            gradient.addColorStop(1, "#764ba2");

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Add decorative border
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 8;
            ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

            // Certificate title
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 48px serif";
            ctx.textAlign = "center";
            ctx.fillText("CERTIFICATE OF ACHIEVEMENT", canvas.width / 2, 150);

            // Decorative line
            ctx.beginPath();
            ctx.moveTo(300, 180);
            ctx.lineTo(900, 180);
            ctx.stroke();

            // "This is to certify that"
            ctx.font = "24px serif";
            ctx.fillText("This is to certify that", canvas.width / 2, 230);
        } else {
            // Use uploaded template
            canvas.width = certificateTemplate.width;
            canvas.height = certificateTemplate.height;

            // Draw the certificate template
            ctx.drawImage(certificateTemplate, 0, 0);
        }

        // Add text overlay
        ctx.textAlign = "center";

        // Name
        ctx.fillStyle = nameColor;
        const nameFontString = nameFont
            ? `${nameFontSize}px ${nameFont}`
            : `bold ${nameFontSize}px Arial`;
        ctx.font = nameFontString;
        ctx.fillText(data.nama || "", namePosition.x, namePosition.y);

        // Remarks
        ctx.fillStyle = remarkColor;
        const remarkFontString = remarkFont
            ? `${remarkFontSize}px ${remarkFont}`
            : `${remarkFontSize}px Arial`;
        ctx.font = remarkFontString;

        if (data.remark1) {
            ctx.fillText(
                data.remark1,
                remarkPositions.remark1.x,
                remarkPositions.remark1.y
            );
        }
        if (data.remark2) {
            ctx.fillText(
                data.remark2,
                remarkPositions.remark2.x,
                remarkPositions.remark2.y
            );
        }
        if (data.remark3) {
            ctx.fillText(
                data.remark3,
                remarkPositions.remark3.x,
                remarkPositions.remark3.y
            );
        }
    };

    const downloadCertificate = (
        data: CertificateData,
        filename?: string
    ): void => {
        const canvas = document.createElement("canvas");
        generateCertificate(data, canvas);

        canvas.toBlob((blob) => {
            if (!blob) return;

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${filename || data.nama || "certificate"}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    };

    // Versi baru: return Blob → dipakai buat ZIP
    const generateCertificateBlob = (data: any): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement("canvas");
            generateCertificate(data, canvas);

            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Gagal membuat blob dari canvas"));
            }, "image/png");
        });
    };

    // Download banyak → ZIP
    const downloadAll = async (): Promise<void> => {
        const zip = new JSZip();

        for (let i = 0; i < excelData.length; i++) {
            const data = excelData[i];
            try {
                const blob = await generateCertificateBlob(data);
                zip.file(`certificate_${data.nama || i + 1}.png`, blob, {
                    binary: true,
                });
            } catch (err) {
                console.error("Gagal generate certificate:", err);
            }
        }

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "all_certificates.zip");
    };

    React.useEffect(() => {
        if (excelData.length > 0 && certificateTemplate && showPreview) {
            generateCertificate(excelData[currentPreview]);
        }
    }, [
        excelData,
        currentPreview,
        nameFont,
        remarkFont,
        nameFontSize,
        remarkFontSize,
        certificateTemplate,
        namePosition,
        remarkPositions,
        nameColor,
        remarkColor,
    ]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-3">
                            <FileText className="h-8 w-8 text-blue-600" />
                            <h1 className="text-2xl font-bold text-gray-900">
                                CertificateGen
                            </h1>
                        </div>
                        <div className="text-sm text-gray-500">
                            Generate certificates easily
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Quick Start Guide */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <HelpCircle className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Quick Start Guide
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center space-x-2">
                                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                        1
                                    </span>
                                    <span className="text-gray-700">
                                        Download samples
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                        2
                                    </span>
                                    <span className="text-gray-700">
                                        Upload certificate template
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                        3
                                    </span>
                                    <span className="text-gray-700">
                                        Upload Excel data
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                        4
                                    </span>
                                    <span className="text-gray-700">
                                        Adjust & download
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Settings Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <Settings className="h-5 w-5 text-gray-600" />
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Settings
                                    </h2>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <HelpCircle className="h-4 w-4 text-gray-400" />
                                    <span className="text-xs text-gray-500">
                                        Need help?
                                    </span>
                                </div>
                            </div>

                            {/* Certificate Template Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Certificate Template{" "}
                                    {certificateTemplate && (
                                        <span className="text-sm text-green-600 font-medium">
                                            ✓ Uploaded
                                        </span>
                                    )}
                                </label>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() =>
                                            templateInputRef.current?.click()
                                        }
                                        className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Choose Template
                                    </button>
                                </div>
                                <input
                                    ref={templateInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleTemplateUpload}
                                    className="hidden"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Upload gambar certificate kosong (PNG, JPG,
                                    etc.)
                                </p>
                            </div>

                            {/* Excel Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Excel File{" "}
                                    {excelData.length > 0 && (
                                        <span className="text-sm text-green-600 font-medium">
                                            {excelData.length} rows
                                        </span>
                                    )}
                                </label>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() =>
                                            excelInputRef.current?.click()
                                        }
                                        className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Choose File
                                    </button>
                                </div>
                                <input
                                    ref={excelInputRef}
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleExcelUpload}
                                    className="hidden"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Format: Nama, Remark 1, Remark 2, Remark 3
                                </p>
                            </div>

                            {/* Text Position Settings */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Text Position Settings
                                </label>

                                {/* Name Position */}
                                <div className="space-y-2 mb-4">
                                    <label className="text-xs font-medium text-gray-600">
                                        Posisi Nama
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs text-gray-500">
                                                X: {namePosition.x}
                                            </label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1200"
                                                value={namePosition.x}
                                                onChange={(e) =>
                                                    setNamePosition({
                                                        ...namePosition,
                                                        x: parseInt(
                                                            e.target.value
                                                        ),
                                                    })
                                                }
                                                className="w-full text-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500">
                                                Y: {namePosition.y}
                                            </label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="800"
                                                value={namePosition.y}
                                                onChange={(e) =>
                                                    setNamePosition({
                                                        ...namePosition,
                                                        y: parseInt(
                                                            e.target.value
                                                        ),
                                                    })
                                                }
                                                className="w-full text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Remark Positions */}
                                {(
                                    ["remark1", "remark2", "remark3"] as const
                                ).map((remark, index) => (
                                    <div
                                        key={remark}
                                        className="space-y-2 mb-3"
                                    >
                                        <label className="text-xs font-medium text-gray-600">
                                            Posisi Remark {index + 1}
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-xs text-gray-500">
                                                    X:{" "}
                                                    {remarkPositions[remark].x}
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1200"
                                                    value={
                                                        remarkPositions[remark]
                                                            .x
                                                    }
                                                    onChange={(e) =>
                                                        setRemarkPositions({
                                                            ...remarkPositions,
                                                            [remark]: {
                                                                ...remarkPositions[
                                                                    remark
                                                                ],
                                                                x: parseInt(
                                                                    e.target
                                                                        .value
                                                                ),
                                                            },
                                                        })
                                                    }
                                                    className="w-full text-xs"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">
                                                    Y:{" "}
                                                    {remarkPositions[remark].y}
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="800"
                                                    value={
                                                        remarkPositions[remark]
                                                            .y
                                                    }
                                                    onChange={(e) =>
                                                        setRemarkPositions({
                                                            ...remarkPositions,
                                                            [remark]: {
                                                                ...remarkPositions[
                                                                    remark
                                                                ],
                                                                y: parseInt(
                                                                    e.target
                                                                        .value
                                                                ),
                                                            },
                                                        })
                                                    }
                                                    className="w-full text-xs"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Font Sizes */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Font Size Nama: {nameFontSize}px
                                    </label>
                                    <input
                                        type="range"
                                        min="8"
                                        max="120"
                                        value={nameFontSize}
                                        onChange={(e) =>
                                            setNameFontSize(
                                                parseInt(e.target.value)
                                            )
                                        }
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Warna Nama
                                    </label>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="color"
                                            value={nameColor}
                                            onChange={(e) =>
                                                setNameColor(e.target.value)
                                            }
                                            className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-600 font-mono">
                                            {nameColor}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Font Size Remark: {remarkFontSize}px
                                    </label>
                                    <input
                                        type="range"
                                        min="8"
                                        max="120"
                                        value={remarkFontSize}
                                        onChange={(e) =>
                                            setRemarkFontSize(
                                                parseInt(e.target.value)
                                            )
                                        }
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Warna Remark
                                    </label>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="color"
                                            value={remarkColor}
                                            onChange={(e) =>
                                                setRemarkColor(e.target.value)
                                            }
                                            className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-600 font-mono">
                                            {remarkColor}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Font Upload */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Font untuk Nama
                                    </label>
                                    <button
                                        onClick={() =>
                                            nameFontInputRef.current?.click()
                                        }
                                        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        {nameFont ? nameFont : "Default Font"}
                                    </button>
                                    <input
                                        ref={nameFontInputRef}
                                        type="file"
                                        accept=".ttf,.otf,.woff,.woff2"
                                        onChange={(e) =>
                                            handleFontUpload(e, "name")
                                        }
                                        className="hidden"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Font untuk Remark
                                    </label>
                                    <button
                                        onClick={() =>
                                            remarkFontInputRef.current?.click()
                                        }
                                        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        {remarkFont
                                            ? remarkFont
                                            : "Default Font"}
                                    </button>
                                    <input
                                        ref={remarkFontInputRef}
                                        type="file"
                                        accept=".ttf,.otf,.woff,.woff2"
                                        onChange={(e) =>
                                            handleFontUpload(e, "remark")
                                        }
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            {/* Download All Button */}
                            {excelData.length > 0 && certificateTemplate && (
                                <button
                                    onClick={downloadAll}
                                    className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download All Certificates
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Preview Panel */}
                    <div className="lg:col-span-2">
                        {/* Sample Downloads */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h3 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
                                <Download className="h-4 w-4 mr-2" />
                                Download Samples
                            </h3>
                            <div className="flex gap-2 md:flex-row flex-col">
                                <button
                                    className="w-full text-left px-3 py-2 bg-white border border-blue-200 rounded-md text-sm text-blue-700 hover:bg-blue-50 transition-colors flex items-center justify-between"
                                    onClick={downloadExcelSample}
                                >
                                    <span>📊 Sample Excel File</span>
                                    <ExternalLink className="h-3 w-3" />
                                </button>
                                <button
                                    className="w-full text-left px-3 py-2 bg-white border border-blue-200 rounded-md text-sm text-blue-700 hover:bg-blue-50 transition-colors flex items-center justify-between"
                                    onClick={downloadCertificateSample}
                                >
                                    <span>🏆 Sample Certificate Template</span>
                                    <ExternalLink className="h-3 w-3" />
                                </button>
                            </div>
                            <p className="text-xs text-blue-600 mt-2">
                                Download contoh file untuk memulai dengan cepat
                            </p>
                        </div>
                        {showPreview && certificateTemplate ? (
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-2">
                                        <Eye className="h-5 w-5 text-gray-600" />
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Preview
                                        </h2>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Users className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm text-gray-500">
                                            {currentPreview + 1} of{" "}
                                            {excelData.length}
                                        </span>
                                    </div>
                                </div>

                                {/* Navigation */}
                                <div className="flex items-center justify-between mb-4">
                                    <button
                                        onClick={() =>
                                            setCurrentPreview(
                                                Math.max(0, currentPreview - 1)
                                            )
                                        }
                                        disabled={currentPreview === 0}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>

                                    <div className="text-sm text-gray-600">
                                        <strong>
                                            {excelData[currentPreview]?.nama ||
                                                "No Name"}
                                        </strong>
                                    </div>

                                    <button
                                        onClick={() =>
                                            setCurrentPreview(
                                                Math.min(
                                                    excelData.length - 1,
                                                    currentPreview + 1
                                                )
                                            )
                                        }
                                        disabled={
                                            currentPreview ===
                                            excelData.length - 1
                                        }
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>

                                {/* Canvas */}
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                                        <canvas
                                            ref={canvasRef}
                                            className="max-w-full h-auto"
                                            style={{ maxHeight: "400px" }}
                                        />
                                    </div>

                                    <button
                                        onClick={() =>
                                            downloadCertificate(
                                                excelData[currentPreview]
                                            )
                                        }
                                        className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        <Download className="h-4 w-4" />
                                        <span>Download This Certificate</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Ready to Generate
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    {!certificateTemplate && !excelData.length
                                        ? "Upload certificate template dan Excel file untuk mulai"
                                        : !certificateTemplate
                                        ? "Upload certificate template untuk melanjutkan"
                                        : "Upload Excel file untuk melanjutkan"}
                                </p>
                                <div className="space-y-2 text-sm text-gray-400">
                                    <div
                                        className={`flex items-center justify-center space-x-2 ${
                                            certificateTemplate
                                                ? "text-green-600"
                                                : ""
                                        }`}
                                    >
                                        <span>
                                            {certificateTemplate ? "✓" : "○"}
                                        </span>
                                        <span>Certificate Template</span>
                                    </div>
                                    <div
                                        className={`flex items-center justify-center space-x-2 ${
                                            excelData.length > 0
                                                ? "text-green-600"
                                                : ""
                                        }`}
                                    >
                                        <span>
                                            {excelData.length > 0 ? "✓" : "○"}
                                        </span>
                                        <span>
                                            Excel Data ({excelData.length} rows)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <footer className="bg-gray-50 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                        {/* Made by */}
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>Made with</span>
                            <Heart className="h-4 w-4 text-red-500 fill-current" />
                            <span>by</span>
                            <a
                                href="https://www.linkedin.com/in/mhmdjaed"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                Juna
                            </a>
                        </div>

                        {/* Support buttons */}
                        <div className="flex items-center space-x-3">
                            <a
                                href="https://ko-fi.com/C1C41LFKSH"
                                target="_blank"
                            >
                                <NextImage
                                    width="88"
                                    height="40"
                                    className="h-8 w-full"
                                    src="https://storage.ko-fi.com/cdn/kofi3.png?v=6"
                                    alt="Buy Me a Coffee at ko-fi.com"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
