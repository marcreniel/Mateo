import { motion } from 'framer-motion';
import Image from 'next/image';

export default function PreLoad() {
    return (
    <>   
    <motion.div className="flex flex-col items-center text-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
    >
        <Image src="/tube-spinner.svg" alt="Loading" width={100} height={100}/>
        <h1 
        className="text-4xl font-normal leading-tighter drop-shadow-md tracking-tight mb-4 pt-10"
        >
        Loading data,
        </h1>
    </motion.div>
    </>
    )
}