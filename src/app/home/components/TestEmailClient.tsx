'use client';

import TestEmailServerComponent from './TestEmailServerComponent';

export default function TestEmailClient() {
    // Starts email send flow when the button is clicked, fetches email
    const handleTestEmail = async () => {
        const data = await fetch('/api/testEmail');
        const { emails } = await data.json();
        handleSummarize(emails);
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
    }
    

  return (
    <TestEmailServerComponent onTestEmail={handleTestEmail}/>
  );
}