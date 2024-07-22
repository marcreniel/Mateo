"use client";
import React, { useRef } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { motion } from "framer-motion";
import { cn } from "@/utils/ui/cn";
import Image from "next/image";

export const StickyScroll = () => {
    const content = [
        {
            title: "Understand your email",
            description:
            "With Mateo, get a full deep dive of your email. From summaries to detailed analysis, Mateo provides you with the insights you need to know whats going on in your inbox. Say goodbye to the days of confusion and hello to the days of clarity.",
            content: (
            <div className="h-full w-full flex items-center justify-center">
                <Image src="/understand.png" width={300} height={300} className="rounded drop-shadow-xl" alt="landing" />
            </div>
            ),
        },
        {
            title: "Instantly Reply with AI",
            description:
            "Mateo's is here to help you fly through your day. With the click of a button, Mateo can generate and send a response on your behalf. Save time and energy by letting Mateo handle the small stuff, so you can focus on the big stuff.",
            content: (
            <div className="h-full w-full flex items-center justify-center">
                <Image src="/sendemailmod.png" width={300} height={300} className="rounded drop-shadow-xl" alt="landing" />
            </div>
            ),
        },
        {
            title: "... and hundreds of other features",
            description:
            "From drafting emails to scheduling meetings, Mateo has you covered. With a wide range of features, Mateo is the only email assistant you'll ever need. Say goodbye to the days of juggling multiple apps and hello to the days of simplicity.",
            content: (
            <div className="h-full w-full flex items-center justify-center">
                <Image src="/landingc.png" width={300} height={300} className="rounded drop-shadow-xl" alt="landing" />
            </div>
            ),
        },
        {
            title: "Free and Open Source",
            description:
            "Mateo is free and open source. We believe that everyone should have access to the tools they need to succeed. Mateo is built by the community, for the community. Join us in making email better for everyone.",
            content: (
            <div className="h-full w-full flex items-center justify-center">
                <Image src="/foss.png" width={300} height={300} className="rounded drop-shadow-xl" alt="landing" />
            </div>
            ),
        },
        ];

    const [activeCard, setActiveCard] = React.useState(0);
    const ref = useRef<any>(null);
    const { scrollYProgress } = useScroll({
        // uncomment line 22 and comment line 23 if you DONT want the overflow container and want to have it change on the entire page scroll
        // target: ref
        container: ref,
        offset: ["start start", "end start"],
    });
    const cardLength = content.length;

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        const cardsBreakpoints = content.map((_, index) => index / cardLength);
        const closestBreakpointIndex = cardsBreakpoints.reduce(
        (acc, breakpoint, index) => {
            const distance = Math.abs(latest - breakpoint);
            if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
            return index;
            }
            return acc;
        },
        0
        );
        setActiveCard(closestBreakpointIndex);
    });

    const backgroundColors = [
    ];
    const linearGradients = [
        "linear-gradient(to bottom right, var(--cyan-500), var(--emerald-500))",
        "linear-gradient(to bottom right, var(--pink-500), var(--indigo-500))",
        "linear-gradient(to bottom right, var(--orange-500), var(--yellow-500))",
    ];
    return (
        <motion.div
        animate={{
            backgroundColor: backgroundColors[activeCard % backgroundColors.length],
        }}
        className="h-[30rem] overflow-y-auto flex justify-center relative space-x-10 rounded-md p-10 no-scrollbar xl:mt-48"
        ref={ref}
        >
        <div className="div relative flex items-start px-4">
            <div className="max-w-2xl">
            {content.map((item, index) => (
                <div key={item.title + index} className="my-20">
                <motion.h2
                    initial={{
                    opacity: 0,
                    }}
                    animate={{
                    opacity: activeCard === index ? 1 : 0.3,
                    }}
                    className="text-2xl font-bold text-black"
                >
                    {item.title}
                </motion.h2>
                <motion.p
                    initial={{
                    opacity: 0,
                    }}
                    animate={{
                    opacity: activeCard === index ? 1 : 0.3,
                    }}
                    className="text-kg text-slate-800 max-w-sm mt-10"
                >
                    {item.description}
                </motion.p>
                </div>
            ))}
            <div className="h-40" />
            </div>
        </div>
        <motion.div
            animate={{
            background: linearGradients[activeCard % linearGradients.length],
            }}
            className={cn(
            "hidden lg:block h-60 w-80 rounded-md bg-white sticky top-10 overflow-hidden",
            )}
        >
            {content[activeCard].content ?? null}
        </motion.div>
        </motion.div>
    );
};
