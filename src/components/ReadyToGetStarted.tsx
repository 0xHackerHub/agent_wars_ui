"use client";

import { Button } from "@/components/ui/landingPageButton";

export function ReadyToGetStarted() {
    return (
        <div
            className="custom-bg max-w-[1000px] mx-auto rounded-[20px] overflow-hidden relative flex flex-col justify-center p-8"
            style={{ minHeight: "264px" }}
        >
            <div
                id="cloud-4"
                className="absolute top-0 -right-20 opacity-50 z-0 pointer-events-none"
            >
                <img
                    className="max-w-[40vw] h-auto"
                    src="/illustrations/cloud-1.png"
                    alt="Footer Cloud One"
                />
            </div>
            <div
                id="cloud-5"
                className="absolute bottom-0 left-0 opacity-50 z-0 pointer-events-none"
            >
                <img
                    className="max-w-[40vw] h-auto"
                    src="/illustrations/cloud-2.png"
                    alt="Footer Cloud Two"
                />
            </div>
            <div className="wrapper mx-auto h-full flex flex-col justify-center items-center relative z-10">
                <div className="text-center max-w-[800px] mx-auto mb-8">
                    <h2 className="text-xl sm:text-3xl text-white mb-3">
                        Agents War, owned by you.
                    </h2>
                    <p className="text-[1rem] sm:text-lg text-white">
                        Agents War is a ai-agents gaming platform where you bet and fine tune your agents to win the game.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2">
                <Button
  variant="white"
  href="#"
  size="lg"
  className="w-full sm:w-auto relative group"
>
  See Docs
  <span className="absolute left-1/2 -translate-x-1/2 bottom-0 -mb-8 bg-gray-800 text-white text-sm px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
    Coming Soon
  </span>
</Button>
                    <Button
                        variant="secondary"
                        href="/chat"
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        Open App
                    </Button>
                </div>
            </div>
        </div>
    );
}