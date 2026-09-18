'use client'

export default function TestTyping() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-xl font-bold mb-4">Typing Test - AI GARAGE</h1>
        <p className="text-sm text-gray-500 mb-4">If this types, then issue is in supabase file. If not, issue is global CSS.</p>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Test 1 - Plain HTML Input (No React State)</label>
            <input 
              type="text" 
              placeholder="Type here - plain HTML"
              className="w-full mt-1 px-4 py-3 border-2 border-gray-300 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Test 2 - Uncontrolled React Input</label>
            <input 
              type="email" 
              placeholder="test@example.com"
              defaultValue=""
              className="w-full mt-1 px-4 py-3 border-2 border-gray-300 rounded-xl outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Test 3 - With State but Simple</label>
            <input 
              type="text" 
              placeholder="Simple state test"
              onChange={(e) => console.log('Typing:', e.target.value)}
              className="w-full mt-1 px-4 py-3 border-2 border-gray-300 rounded-xl outline-none focus:border-yellow-400"
            />
          </div>
        </div>

        <div className="mt-6 p-3 bg-yellow-50 rounded-xl text-xs">
          <p className="font-bold">Debug Steps:</p>
          <p>1. Try typing in all 3 boxes above</p>
          <p>2. Press F12 - Console tab - any red errors?</p>
          <p>3. If NONE types - issue is in globals.css</p>
          <p>4. If Test 1 types but others don't - React issue</p>
        </div>
      </div>
    </div>
  )
}
