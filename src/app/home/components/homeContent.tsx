"use client";

import {Button, Textarea} from "@nextui-org/react";
import { useState, SetStateAction } from "react";
import ArrowUp from "./ArrowUp";
import SendIcon from "./SendIcon";
import { motion } from 'framer-motion';

export default function HomeContent(props: any) {
    // Props from the parent component (name)
    const name = props.props;

    // State for the text content
    const [textContent, setTextContent] = useState("");

    // Functions for pre-defined prompts
    const option1 = () => {
        setTextContent("Can you send a reply on my behalf?");
    }

    const option2 = () => {
        setTextContent("Can you summarize my inbox for me?");
    }

    const option3 = () => {
        setTextContent("Can you forward an email to someone?");
    }

    // Function to handle the text area change
    const handleTextareaChange = (event: { target: { value: SetStateAction<string>; }; }) => {
        setTextContent(event.target.value);
      };
    
    return (
        <>
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
        <motion.div 
        className="flex flex-row items-center justify-center space-x-5 fixed bottom-0 w-full p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3.2 }}
        >
            <Textarea variant="underlined" color="primary" minRows={1.5} placeholder="Tell me how I can help your inbox!" value={textContent} onChange={handleTextareaChange} className="max-w-96 drop-shadow-md"/>
            <Button isIconOnly size="lg" className="bg-gradient-to-b drop-shadow-lg from-harvest-gold-600 to-harvest-gold-800 "><SendIcon/></Button>
        </motion.div>
    </>
    );
}