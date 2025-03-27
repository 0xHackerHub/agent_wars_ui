"use client";

import { ReadyToGetStarted } from "@/components/ReadyToGetStarted";
import {
    detectPlatform,
    getDownloadButtonText,
    getDownloadUrl,
    getPlatformIcon,
    PlatformIcons,
} from "@/utils/platform";
import { Button } from "@/components/ui/landingPageButton";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion } from "framer-motion";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Parallax, ParallaxProvider } from "react-scroll-parallax";
import { LogoSection } from "@/components/LogoSection";
import {Icons} from "@/components/icons"
import FeaturesGrid from "@/components/features-grid";
import Image from "next/image";

export const LandingPage = () => {
    const [loading, setLoading] = useState(true);
    const [platform, setPlatform] = useState<string | null>(null);
    const [isIntel, setIsIntel] = useState(false);

    useEffect(() => {
        const detectUserPlatform = async () => {
            try {
                const { platform, isIntel } = await detectPlatform();
                setPlatform(platform);
                setIsIntel(isIntel);
            } catch (error) {
                console.error("Error detecting platform:", error);
            } finally {
                setLoading(false);
            }
        };

        detectUserPlatform();
    }, []);

    return (
        <ParallaxProvider>
            <div className="mt-[120px]">
                <div className="relative z-10 px-5 w-full">
                    <div className="mx-auto text-center wrapper wrapper-sm">
                        <Link
                            href="https://x.com/aiagentw"
                            target="_blank"
                            className="flex gap-3 transition-opacity duration-300
                 hover:opacity-90 mb-[52px] items-center relative z-[20] px-4 py-2
               mx-auto bg-[#2e2e2e] rounded-full border w-fit border-zinc-200"
                        >
                            <p className="text-xs text-white sm:text-sm">
                                Move AI Hackathon:{" "}
                                <span className="text-xs font-bold text-blue-100 sm:text-sm">
                  Agent-W
                </span>
                            </p>
                            <FontAwesomeIcon
                                fontWeight="light"
                                className="w-2 text-white"
                                icon={faAngleRight}
                            />
                        </Link>
                        <h3 className="relative z-10 text-base text-black fade-in-down">
                            Compete. Strategize. Elevate.
                        </h3>
                        <h1 className="fade-in-down text-[2rem] font-bold leading-[2.5rem] md:text-[3.75rem] md:leading-[4rem] relative z-10 text-black mb-4">
                            Bet on the future of AI Agents
                            <br />
                            configurable by you.
                        </h1>
                        <p className="mx-auto mb-8 max-w-3xl text-md sm:text-xl text-zinc-500 fade-in-down animate-delay-1">
                        AgentW: Your intelligent companion across the Aptos ecosystem - connecting 10+ DeFi protocols, executing cctp transaction, and preparing for battle in Agent Wars. Command once, accomplish everything.
                        </p>
                    </div>
                    <div className="flex flex-col justify-center items-center mb-5 space-y-2 fade-in-up animate-delay-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <Button
                            variant="white"
                            href="#features"
                            size="lg"
                            className="flex justify-center items-center w-full font-medium text-md sm:w-auto"
                        >
                            Features
                        </Button>
                        <Button
                            variant="radialblue"
                            href="/chat"
                            size="lg"
                            className="relative z-[20] w-full font-medium text-md sm:w-auto"
                        >
                            Open App
                        </Button>
                    </div>
                    <p className="text-sm text-center text-zinc-400 animate-delay-2 fade-in-up">
                        We are currently in beta.
                    </p>

                    {/* Platform icons */}
                    <PlatformIcons />

                    {/* See other options button */}
                    <div className="flex justify-center mt-2">
                        <Link
                            href="/"
                            className="text-sm text-center underline text-zinc-400 animate-delay-2 fade-in-up hover:text-zinc-500"
                        >
                            Live on Aptos
                        </Link>
                    </div>
                </div>
                <Parallax
                    className="relative flex items-center justify-center w-full max-w-[540px] mx-auto mt-[100px] mb-[190px] sm:mt-[160px] sm:mb-[200px]"
                    scale={[1, 1.6]}
                >
                    <motion.div
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.05 }}
                        // onClick={() => setVideoToggled(true)}
                        className="absolute cursor-pointer size-[100px] flex items-center justify-center group"
                    >
                        {/* <div
              style={{
                background:
                  "linear-gradient(180deg, rgba(255, 255, 255, 0.10) 30%, #3B7BFA 100%)",
                boxShadow: "0px 0px 40px 16px rgba(25, 39, 67, 0.25)",
              }}
              className="size-[100px] relative backdrop-blur-[6px] rounded-full flex items-center justify-center play-button-outer-border"
            >
              <div
                className="size-[80px] flex items-center justify-center relative inner-play-button-border-two group-hover:brightness-110 transition-all duration-300 backdrop-blur-[6px] rounded-[80px]"
                style={{
                  background:
                    "linear-gradient(180deg, #90BDFF 0%, #3588FF 100%)",
                  boxShadow:
                    "0px 2px 0px 0px #C5DDFF inset, 0px 12px 6.3px -2px #A5CAFF inset, 0px -7px 9.2px 0px #305098 inset, 0px 14px 20px -8px #0E275E, 0px -19px 24px 0px #2363BF inset",
                }}
              >
                <FontAwesomeIcon
                  className="text-white size-5 drop-shadow-[0px_0px_5px_rgba(255,255,255)]"
                  icon={faPlay}
                />
              </div>
            </div> */}
                    </motion.div>
                    <img
                        src="/illustrations/Chat.png"
                        className="mx-auto w-full max-w-[540px] pointer-events-none h-auto rounded-xl"
                        alt="Landing Page Screenshot Banner"
                    />
                </Parallax>
                {/** Header BG */}
                <div className="w-full mx-auto overflow-hidden h-[830px] absolute top-0 left-0">
                    <motion.div
                        animate={{
                            x: [0, "30vw"],
                            top: 340,
                            opacity: [0.7, 0.5],
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "linear",
                        }}
                        className="absolute opacity-70 top-[340px] -left-[200px] z-[9]
      w-full max-w-[1800px] h-[100px] bg-gradient-to-l from-transparent via-white/90 to-white"
                        style={{
                            borderRadius: "100%",
                            mixBlendMode: "plus-lighter",
                            filter: "blur(50px)",
                        }}
                    />
                    <motion.div
                        initial={{
                            right: -200,
                            top: 150,
                            opacity: 0.25,
                        }}
                        animate={{
                            right: [-200, 400],
                            opacity: [0.25, 0.1, 0.25],
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "linear",
                        }}
                        className="absolute mix-blend-plus-lighter z-[9] w-full max-w-[800px] h-[200px]
      blur-[60px] rounded-full bg-gradient-to-r from-transparent via-white to-white"
                    />
                    <Icons.LeftBlueHue />
                    {/** Clouds */}
                    <motion.img
                        style={{
                            mixBlendMode: "plus-lighter",
                        }}
                        initial={{
                            right: 100,
                            top: 50,
                            rotate: 180,
                        }}
                        animate={{
                            x: "-100vw",
                        }}
                        transition={{
                            duration: 500,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "linear",
                        }}
                        className="absolute w-full max-w-[500px] z-[5] select-none"
                        src="./illustrations/bottomcloud.webp"
                        alt="bottomcloudthree"
                    />
                    <motion.img
                        style={{
                            mixBlendMode: "plus-lighter",
                        }}
                        animate={{
                            x: [0, "100vw"],
                        }}
                        transition={{
                            duration: 300,
                            repeat: Infinity,
                            repeatType: "reverse",
                        }}
                        className="absolute
            top-[180px] w-full max-w-[280px] z-[4] right-[60px] md:right-[600px] select-none"
                        src="./illustrations/smallcloudthree.webp"
                        alt="smallcloudfour"
                    />
                    <motion.img
                        style={{
                            mixBlendMode: "screen",
                        }}
                        animate={{
                            x: [0, "100vw"],
                        }}
                        transition={{
                            duration: 100,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "linear",
                        }}
                        className="absolute top-[20px] left-[-60px] md:left-[-400px] select-none z-[5] pointer-events-none"
                        src="./illustrations/bottomcloud.webp"
                        alt="bottomcloudthree"
                    />
                    <img
                        className="absolute
            top-[180px] w-full max-w-[400px] z-0 select-none right-[60px] opacity-30 pointer-events-none"
                        src="/illustrations/smallcloudthree.webp"
                        alt="smallcloudthree"
                    />
                    <motion.img
                        style={{
                            mixBlendMode: "screen",
                        }}
                        animate={{
                            x: [0, "-100vw"],
                        }}
                        transition={{
                            duration: 120,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "linear",
                        }}
                        className="absolute
        bottom-[240px] w-full max-w-[430px] z-[1] right-[40px] select-none  opacity-80 brightness-125 pointer-events-none"
                        src="./illustrations/smallcloudtwo.webp"
                        alt="smallcloudtwo"
                    />
                    <img
                        style={{
                            mixBlendMode: "screen",
                        }}
                        className="absolute
         w-full max-w-[500px] top-[210px] right-[300px] z-[2] select-none  brightness-125 pointer-events-none"
                        src="/illustrations/chipcloud.webp"
                        alt="chipcloudtwo"
                    />
                    <motion.img
                        style={{
                            mixBlendMode: "screen",
                        }}
                        initial={{
                            x: -200,
                            rotate: 180,
                        }}
                        animate={{
                            x: [-200, "100vw"],
                        }}
                        transition={{
                            duration: 200,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "linear",
                        }}
                        className="absolute
         w-full max-w-[500px] bottom-[15px] select-none left-[-200px] lg:left-[30px] z-[10] pointer-events-none"
                        src="./illustrations/chipcloud.webp"
                        alt="chipcloudfour"
                    />
                    <img
                        className="absolute
         w-full max-w-[500px] top-[160px] select-none mix-blend-screen left-[-200px] lg:left-[30px] z-[10] pointer-events-none"
                        src="/illustrations/chipcloud.webp"
                        alt="chipcloud"
                    />
                    <img
                        className="absolute bottom-[-200px] -left-[500px] select-none z-[5] pointer-events-none"
                        src="/illustrations/bottomcloud.webp"
                        alt="bottomcloud"
                    />
                    <img
                        className="absolute bottom-[-90px] right-[-400px] select-none z-[5] pointer-events-none"
                        src="/illustrations/bottomcloud.webp"
                        alt="bottomcloudtwo"
                    />
                </div>
                {/** Right Blue Hue */}
                <div
                    className="w-[868px] h-[502px] bg-gradient-to-l rounded-full blur-[100px]
      absolute top-20 z-[0] right-0 from-[#A6D7FF] to-transparent"
                />
            </div>
            <div className="pb-32 wrapper md:pb-40">
                <div className="mb-4">
                    <Icons.PowerfulFeaturesSVG />
                </div>
                <div className="text-center max-w-[800px] mx-auto mb-8">
                    <h2 className="mb-3">Crafted for simplicity</h2>
                    <p className="text-[1.125rem] leading-[1.75rem]">
                        We believe in simplicity. Our platform is designed to be intuitive and easy to use.
                        Powered by Aptos, our platform is built on the Aptos blockchain.
                    </p>
                </div>
                <FeaturesGrid />
            </div>
            <div className="px-5 mb-32 md:mb-40">
                <ReadyToGetStarted />
            </div>
            <div className="w-full rounded-t-[80px] border-t border-joule_orange bg-white pb-6 pt-[62px]">
      <div className="mx-auto flex max-w-[1220px] flex-col items-center">
        <span className="flex items-center gap-3">
          <Image src="/logos/logo.png" alt="Joule Logo" width={50} height={50} />
          <p className="text-[26px] font-medium">Agent-W</p>
        </span>
        <span className="mt-7 w-full text-center text-xl md:text-[80px] font-semibold leading-[92px]">
        Your intelligent companion across the 
          {' '}
          <span className="text-joule_orange">Aptos ecosystem</span>
        </span>
        <div className="flex w-full items-center justify-center space-x-4 lg:justify-center mt-20">
            <Link
              className="size-[52px] md:size-[60px] bg-white grid place-items-center border border-joule_gray-15 rounded-xl group -mt-5"
              target="_blank"
              href="https://t.me/"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="size-8 transition-all md:size-8" width="35" height="35" viewBox="0 0 35 35" fill="inherit">
  <path d="M27.6261 7.59312C24.407 8.9264 10.6038 14.6439 6.78994 16.2021C4.23221 17.2003 5.72954 18.1361 5.72954 18.1361C5.72954 18.1361 7.91286 18.8847 9.78458 19.4461C11.656 20.0076 12.6542 19.3839 12.6542 19.3839L21.4503 13.4574C24.5694 11.3363 23.8209 13.083 23.0721 13.8318C21.4503 15.4539 18.7677 18.0113 16.5219 20.0701C15.5238 20.9434 16.0227 21.692 16.4596 22.0664C18.0815 23.4389 22.5109 26.2462 22.7603 26.4333C24.0781 27.3663 26.6704 28.7092 27.0646 25.8718L28.6242 16.0776C29.1234 12.7714 29.6224 9.71444 29.6846 8.84111C29.8719 6.71979 27.6261 7.59312 27.6261 7.59312Z" className="fill-black group-hover:fill-joule_orange transition-colors" />
              </svg>
            </Link>
            <Link
              className="size-[52px] md:size-[60px] bg-white grid place-items-center border border-joule_gray-15 rounded-xl group -mt-5"
              target="_blank"
              href="https://x.com/aiagentw"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="size-8 transition-all md:size-8" width="35" height="35" viewBox="0 0 35 35" fill="none">
  <g clipPath="url(#clip0_8588_28065)">
    <mask id="mask0_8588_28065" mask-type="luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="35" height="35">
      <path d="M34.2721 0.729736H0.725311V34.2765H34.2721V0.729736Z" fill="white" />
    </mask>
    <g mask="url(#mask0_8588_28065)">
      <path d="M24.0418 7.28345H27.5097L19.9334 15.9427L28.8463 27.726H21.8675L16.4015 20.5795L10.1471 27.726H6.67718L14.7808 18.4639L6.23059 7.28345H13.3865L18.3273 13.8156L24.0418 7.28345ZM22.8247 25.6503H24.7463L12.3424 9.25013H10.2803L22.8247 25.6503Z" className="fill-black group-hover:fill-joule_orange transition-colors" />
    </g>
  </g>
  <defs>
    <clipPath id="clip0_8588_28065">
      <rect width="33.5467" height="33.5467" fill="white" transform="translate(0.720398 0.723633)" />
    </clipPath>
  </defs>
            </svg>
            </Link>
            
        </div>
        <div className="mt-[135px] flex flex-col md:flex-row justify-center w-full md:justify-between px-5 xl:px-0">
          <div className="flex gap-6 *:text-xs md:*:text-sm *:underline justify-center">
            <Link href="/">Terms of use</Link>
            {/* <Link href="/">Privacy Policy</Link> */}
            <Link href="/">Media Kit</Link>
            <Link href="/">Docs</Link>
          </div>
          <div className="text-center text-xs md:text-base mt-6 md:mt-0">
            ©️2025 Nisarg Thakkar. All rights reserved.
          </div>
        </div>
      </div>
    </div>
        </ParallaxProvider>
    );
};