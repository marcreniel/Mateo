"use client";

import { Button, Textarea } from "@nextui-org/react";
import { useRef, useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { useChat } from 'ai/react'
import ArrowUp from "./arrowUp";
import SendIcon from "./sendIcon";
import { Avatar } from "@nextui-org/react";

export default function HomeContent(props: any) {
    // Props from the parent component (name)
    const { name, avatar } = props.props;

    // Function from the useChat hook (Vercel AI SDK)
    const { messages, input, handleInputChange, setInput, handleSubmit } = useChat()

    // State for the text content
    const [chatActive, setChatActive] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Scroll to the bottom of the container when messages change
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages]);

    // Functions for pre-defined prompts
    const option1 = () => {
        setInput("Can you send a reply on my behalf?");
    }

    const option2 = () => {
        setInput("Can you summarize my inbox for me?");
    }

    const option3 = () => {
        setInput("Can you forward an email to someone?");
    }

    // Debugging tool effect
    useEffect(() => {
        console.log(messages)
    }, [messages])

    return (
        <>
        {chatActive === true && (
            <div className="mx-auto w-full max-w-3xl pt-24 overflow-y-auto no-scrollbar" style={{ maxHeight: '80vh' }} ref={containerRef}>
                {messages.map(m => (
                    <div key={m.id}>
                        {m.role === 'user' ?  
                            <div className="flex flex-row space-x-2">                   
                            <Avatar
                            className="drop-shadow-[0_0px_2px_rgba(0,0,0,0.6)] w-6 h-6 transition-transform ml-1 my-2"
                            name={name}
                            src={avatar}
                            />
                            <h2 className="font-bold pt-2">You</h2> 
                            </div>     
                            : 
                            <div className="flex flex-row space-x-2">                   
                            <Avatar
                            className="drop-shadow-[0_0px_2px_rgba(0,0,0,0.6)] w-6 h-6 transition-transform ml-1 my-2"
                            name="M"
                            />
                            <h2 className="font-bold pt-2">Mateo</h2> 
                            </div>    
                            }
                        <motion.p 
                        className="bg-harvest-gold-200 rounded-xl p-2 mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}>{m.content}</motion.p>
                    </div>
                ))}
            </div>

        )}
        {chatActive === false && (
        <div className="flex flex-col pt-12 h-max space-y-32">
            <div className="flex flex-col items-center text-center justify-center">
                <motion.h1 
                className="text-5xl md:text-6xl font-extrabold leading-tighter drop-shadow-md tracking-tight mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                >
                Welcome back,
                </motion.h1>
                <motion.h2 
                className="text-5xl bg-clip-text font-bold text-transparent bg-gradient-to-b drop-shadow-md from-harvest-gold-600 to-harvest-gold-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                >
               {name}
                </motion.h2>
            </div>
            <motion.div 
            className="flex flex-col items-center text-center justify-center space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.6 }}
            >
                <Button size="lg" variant="bordered" onPress={option1}>
                    Can you send a reply on my behalf?
                    <ArrowUp/>
                </Button> 
                <Button size="lg" variant="bordered" onPress={option2}>
                    Can you summarize my inbox for me?
                    <ArrowUp/>
                </Button> 
                <Button size="lg" variant="bordered" onPress={option3}>
                    Can you forward an email to someone?
                    <ArrowUp/>
                </Button> 
            </motion.div>
        </div>
        )}
        <motion.form 
        onSubmit={handleSubmit}
        className="flex flex-row items-center justify-center space-x-5 fixed bottom-0 w-full p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3.2 }}
        >
            <Textarea variant="underlined" color="primary" minRows={1.5} placeholder="Tell me how I can help your inbox!" value={input} onChange={handleInputChange} className="max-w-96 drop-shadow-md"/>
            <Button type="submit" isIconOnly size="lg" onPress={() => setChatActive(true)} className="bg-gradient-to-b drop-shadow-lg from-harvest-gold-600 to-harvest-gold-800"><SendIcon/></Button>
        </motion.form>
    </>
    );
}