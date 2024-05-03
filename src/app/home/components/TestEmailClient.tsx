'use client';

import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure} from "@nextui-org/react";
import { useState } from 'react';
import Image from 'next/image'
import dynamic from 'next/dynamic';

// Dynamic import since lottie-player has react hooks, SSR incompatible
const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then((module) => module.Player), {
  ssr: false,
});

export default function TestEmailClient() {
  // States for the testing modals
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [flow, setFlow] = useState("");

  // Starts email send flow when the button is clicked, fetches email
  const handleTestEmail = async () => {
      const data = await fetch('/api/testEmail');
      const { emails } = await data.json();
      handleSummarize(emails);
      setFlow("generation");
  };
  
  // Summarizes the emails
  const handleSummarize = async (emails: JSON[]) => {
      var summaryArrays = []
      for (const email of emails) {
          const stringedEmail = JSON.stringify(email);
              
          const data = await fetch('/api/testSummarize', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: stringedEmail,
            });            
          const parsed = await data.json();
          summaryArrays.push(parsed);
      }
      handleSend(summaryArrays);
      setFlow("compose");
  };

  // Sends the email with the summaries
  const handleSend = async (summaries: JSON[]) => {
    const data = await fetch('/api/testCompose', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(summaries),
    });   
    console.log(data)
    setFlow("done");
  }
    
  // Runs the email flow when the modal is opened
  function startFlow() {
    onOpen();
    handleTestEmail();
    setFlow("email");
  }

  return (
    <>
      <Button variant="bordered" onPress={() => startFlow()}>Handle Test Email</Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={false} isKeyboardDismissDisabled={false} hideCloseButton={true}> 
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-row justify-center items-center gap-1">Testing Email Flow</ModalHeader>
              <ModalBody className="flex flex-col items-center">
                {flow !== "done" && <Image src="/tube-spinner.svg" alt="Loading" width={100} height={100}/>} 
                {flow === "done" && <Player
                  autoplay={true}
                  keepLastFrame
                  src="/check-anim.json"
                  style={{
                    height: '200px',
                    width: '300px',
                    boxSizing: 'border-box',
                    padding: '20px',
                  }}/>
                }
                {flow === "email" && <p> Fetching Emails </p>}
                {flow === "generation" && <p> Generating Summaries </p>}
                {flow === "compose" && <p> Composing Send </p>}
                {flow === "done" && <p>Test Email Sent to Inbox!</p>}
              </ModalBody>
              <ModalFooter>
                {flow === "done" &&
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                }
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}