'use client';

import { useState, useEffect } from 'react';
import TestEmailServerComponent from './TestEmailServerComponent';

export default function TestEmailClient() {
    const [emails, setEmails] = useState<JSON[]>([]);
    const [summaries, setSummaries] = useState<JSON[]>([]);

    const handleTestEmail = async () => {
        const data = await fetch('/api/testEmail');
        const { emails } = await data.json();
        setEmails(emails);
        handleSummarize(emails);
    };

    const handleSummarize = async (emails: JSON[]) => {
        var summaryArrays = []
        for (const email of emails) {
            const stringedEmail = JSON.stringify(email);
            const encodedEmail = encodeURIComponent(stringedEmail);

            const data = await fetch('/api/testSummarize?email=' + encodedEmail);
            const parsed = await data.json();
            summaryArrays.push(parsed);
        }
        setSummaries(summaryArrays);
        console.log(summaryArrays)
    }

  return (
    <TestEmailServerComponent onTestEmail={handleTestEmail} emails={emails} />
  );
}