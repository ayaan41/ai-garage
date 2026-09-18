"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function DebugPage() {
  const [info, setInfo] = useState<any>({});
  const [testResult, setTestResult] = useState("");

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    setInfo({
      url_exists: !!url,
      url_value: url?.substring(0, 40) + "...",
      url_full: url,
      key_exists: !!key,
      key_length: key?.length,
      key_start: key?.substring(0, 20) + "...",
      key_end: "..." + key?.substring(key.length - 10),
      env_loaded: typeof window !== "undefined" ? "Client side" : "Server side"
    });

    // Test Supabase connection
    const test = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setTestResult("ERROR: " + error.message);
        } else {
          setTestResult("SUCCESS: Supabase connected! Session: " + JSON.stringify(data));
        }
      } catch (e: any) {
        setTestResult("CATCH ERROR: " + e.message);
      }
    };
    test();
  }, []);

  return (
    <div className="min-h-screen bg-white p-8 text-black">
      <h1 className="text-2xl font-bold mb-6">Supabase Debug - AI GARAGE</h1>
      <div className="bg-gray-100 p-4 rounded mb-4">
        <pre className="text-xs overflow-auto">{JSON.stringify(info, null, 2)}</pre>
      </div>
      <div className="bg-blue-50 p-4 rounded mb-4 border border-blue-200">
        <h3 className="font-bold mb-2">Connection Test:</h3>
        <p className="text-sm">{testResult || "Testing..."}</p>
      </div>
      <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
        <h3 className="font-bold mb-2">Next Steps:</h3>
        <ol className="list-decimal pl-5 text-sm space-y-1">
          <li>If key_length is NOT 200+ chars, .env.local has truncated key</li>
          <li>If url_exists false, .env.local not loaded - restart needed</li>
          <li>If ERROR Invalid API key - project paused in Supabase dashboard - unpause it</li>
          <li>Go to supabase.com → Your Project → Should show ACTIVE green dot</li>
        </ol>
      </div>
    </div>
  );
}
