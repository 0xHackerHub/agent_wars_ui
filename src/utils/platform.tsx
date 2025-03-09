import React from "react";
import {ChainIcons, Icons} from "@/components/icons";

export interface PlatformInfo {
    platform: string | null;
    isIntel: boolean;
}

export const detectPlatform = async (): Promise<PlatformInfo> => {
    let platform: string | null = null;
    let isIntel = false;

    // First try to use the newer navigator.userAgentData API (Chrome, Edge)
    if (
        typeof navigator !== "undefined" &&
        "userAgentData" in navigator &&
        "getHighEntropyValues" in (navigator as any).userAgentData
    ) {
        try {
            const uaData = await (
                navigator as any
            ).userAgentData.getHighEntropyValues(["architecture", "platform"]);
            if (uaData.platform === "macOS") {
                platform = "macos";
                isIntel =
                    uaData.architecture !== "arm" && uaData.architecture !== "arm64";
                return { platform, isIntel };
            } else if (uaData.platform === "Windows") {
                platform = "windows";
                return { platform, isIntel };
            }
        } catch (e) {
            console.log("Error getting high entropy values:", e);
        }
    }

    // Fallback to user agent detection
    if (typeof navigator !== "undefined") {
        const userAgent = navigator.userAgent;

        if (userAgent.includes("Windows")) {
            platform = "windows";
            return { platform, isIntel };
        } else if (userAgent.includes("Mac")) {
            platform = "macos";

            // For Macs, we need to do additional detection for Apple Silicon vs Intel
            try {
                // Try WebGL renderer detection (works in Chrome, Firefox)
                const canvas = document.createElement("canvas");
                const gl = canvas.getContext("webgl");

                if (gl) {
                    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
                    if (debugInfo) {
                        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

                        if (renderer) {
                            // Apple Silicon Macs typically show "Apple GPU" in renderer
                            if (renderer.match(/Apple/) && !renderer.match(/Apple GPU/)) {
                                isIntel = true; // Likely Intel
                                return { platform, isIntel };
                            }

                            // For Safari which hides GPU info, check for specific extensions
                            if (renderer.match(/Apple GPU/)) {
                                // Check for specific WebGL extensions that might differ between architectures
                                const extensions = gl.getSupportedExtensions() || [];
                                // This is a heuristic and may need adjustment over time
                                if (
                                    extensions.indexOf("WEBGL_compressed_texture_s3tc_srgb") ===
                                    -1
                                ) {
                                    isIntel = false; // Likely Apple Silicon
                                    return { platform, isIntel };
                                }
                            }
                        }
                    }
                }

                // If we get here and it's a Mac, default to Intel for older Macs
                // This is a fallback and may not be 100% accurate
                isIntel = true;
            } catch (e) {
                console.log("Error detecting Mac architecture:", e);
                // Default to Intel as a safer fallback for older Macs
                isIntel = true;
            }
        } else if (userAgent.includes("Linux")) {
            platform = "linux";
        } else {
            // Default to macOS if we can't detect
            platform = "macos";
            // Default to Apple Silicon for newer Macs
            isIntel = false;
        }
    }

    return { platform, isIntel };
};

export const getDownloadUrl = (
    platform: string | null,
    isIntel: boolean
): string => {
    if (platform === "windows") {
        return "/download/windows";
    } else if (platform === "macos") {
        return isIntel ? "/download/apple-intel" : "/download/apple-silicon";
    } else {
        // Default to Apple Silicon
        return "/download/apple-silicon";
    }
};

export const getDownloadButtonText = (
    platform: string | null,
    loading: boolean,
    isIntel: boolean = false
): string => {
    if (loading) {
        return "Download Cap";
    } else if (platform === "windows") {
        return "Download for Windows (Beta)";
    } else if (platform === "macos") {
        return isIntel ? "Download for Apple Intel" : "Download for Apple Silicon";
    } else {
        return "Download Cap";
    }
};

export const getPlatformIcon = (platform: string | null): React.ReactNode => {
    if (platform === "windows") {
        return (
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0,0H11.377V11.372H0ZM12.623,0H24V11.372H12.623ZM0,12.623H11.377V24H0Zm12.623,0H24V24H12.623" />
            </svg>
        );
    } else if (platform === "macos") {
        return (
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
            </svg>
        );
    } else {
        return null;
    }
};

export const getVersionText = (platform: string | null): React.ReactNode => {
    if (platform === "macos") {
        return <>macOS 13.1+ recommended</>;
    } else if (platform === "windows") {
        return <>Windows 10+ recommended</>;
    } else {
        return <>macOS 13.1+ recommended</>;
    }
};

export const PlatformIcons: React.FC = () => {
    return (
        <div className="relative z-10 mt-5 flex justify-center gap-3 animate-delay-2 fade-in-up">
            <div>
                <button
                    onClick={() => {
                        window.location.href = "/download/apple-silicon";
                    }}
                    className="focus:outline-none"
                    aria-label="Live on Aptos"
                >
                    <ChainIcons.aptos className="w-10 h-10" />

                </button>
            </div>
        </div>
    );
};